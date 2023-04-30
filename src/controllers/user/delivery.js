const { PolyUtil } = require('node-geometry-library');

const axios = require('axios');

const DeliveryArea = require('../../models/deliveryArea');
const Restaurant = require('../../models/restaurant');

exports.checkDelivery = (req, res, next) => {
  const {
    placeId: deliveryPlaceId,
    restaurantId,
    address
  } = req.body;

  const calcDistanceInLine = (restaurantPoint, destinationPoint) => {
    const toRad = (val) => (val * (Math.PI / 180));

    const R = 6371;
    const dLat = toRad(destinationPoint.lat - restaurantPoint.lat);
    const dLng = toRad(destinationPoint.lng - restaurantPoint.lng);
    const restaurantPointLat = toRad(restaurantPoint.lat);
    const destinationPointLat = toRad(destinationPoint.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(restaurantPointLat) * Math.cos(destinationPointLat);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c * 1000;
    return d;
  };

  const getDestinationData = (url) => (
    axios.get(url)
      .then((response) => {
        console.log('point details:', response.data.result);
        return response.data.result;
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      })
  );

  const getPointsCords = (restaurantPlaceId, destinationPlaceId) => {
    const restaurantCordsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${restaurantPlaceId}&key=${process.env.GOOGLE_API_KEY}`;
    const destinationCordsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${destinationPlaceId}&key=${process.env.GOOGLE_API_KEY}`;

    const getRestaurantCords = (url) => (
      axios.get(url)
        .then((response) => (
          response.data.result.geometry.location
        ))
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        })
    );

    const cords = {};

    return getRestaurantCords(restaurantCordsUrl)
      .then((restaurantCords) => { cords.restaurantCords = restaurantCords; })
      .then(() => getDestinationData(destinationCordsUrl))
      .then((destinationData) => { cords.destinationCords = destinationData.geometry.location; })
      .then(() => cords)
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  const getRestaurantPlaceId = (id) => Restaurant.findById({ _id: id })
    .then((restaurant) => restaurant.placeId)
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  const getDistanceInLine = (id, deliveryId) => getRestaurantPlaceId(id)
    .then((restaurantPlaceId) => getPointsCords(restaurantPlaceId, deliveryId))
    .then((cordsObj) => calcDistanceInLine(cordsObj.restaurantCords, cordsObj.destinationCords))
    .then((response) => response)
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  const getCircleDeliveryAreas = (id) => DeliveryArea.findOne({ restaurantId: id })
    .populate('deliveryAreaItems')
    .then((deliveryArea) => (
      deliveryArea.deliveryAreaItems.filter((areaItem) => (areaItem.radius ? areaItem : null))
    ))
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  const getPolygonDeliveryAreas = (id) => (
    DeliveryArea.findOne({ restaurantId: id })
      .populate('deliveryAreaItems')
      .then((deliveryArea) => (
        deliveryArea.deliveryAreaItems.filter((areaItem) => (areaItem.polygon.length > 0 ? areaItem : null))
      ))
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      })
  );

  const checkCircleDeliveryArea = (distance, deliveryAreaItems) => {
    const filteredAreas = deliveryAreaItems.filter((area) => area.radius > distance);

    if (filteredAreas.length === 0) {
      return false;
    }
    const area = filteredAreas.reduce((prev, curr) => (
      Math.abs(curr.radius - distance) < Math.abs(prev.radius - distance) ? curr : prev
    ));

    return area.price;
  };

  const getDeliveryAreaType = (id, placeId) => DeliveryArea.findOne({ restaurantId: id })
    .then((deliveryArea) => (
      deliveryArea.type
    ))
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  const containsPoint = (pointGeo, polygon) => {
    const result = PolyUtil.containsLocation(pointGeo, polygon);
    return result;
  };

  return getDeliveryAreaType(restaurantId, deliveryPlaceId)
    .then((type) => {
      if (type === 'circle') {
        let addressComponents = [];

        getDestinationData(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${deliveryPlaceId}&key=${process.env.GOOGLE_API_KEY}`)
          .then((val) => {
            addressComponents = val.address_components;
          }).then(() => {
            getDistanceInLine(restaurantId, deliveryPlaceId)
              .then((distance) => {
                getCircleDeliveryAreas(restaurantId)
                  .then((deliveryAreas) => ({
                    deliveryAreas,
                    distancex: distance
                  }))
                  .then(({ deliveryAreas, distancex }) => checkCircleDeliveryArea(distancex, deliveryAreas))
                  .then((val) => {
                    res.status(200).json({
                      message: 'Delivery Price Circle',
                      price: val,
                      addressComponents,
                      address
                    });
                  })
                  .catch((err) => {
                    if (!err.statusCode) {
                      err.statusCode = 500;
                    }
                    next(err);
                  });
              });
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else if (type === 'polygon') {
        let destinationCords = {};
        let addressComponents = [];

        getDestinationData(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${deliveryPlaceId}&key=${process.env.GOOGLE_API_KEY}`)
          .then((val) => {
            destinationCords = val.geometry.location;
            addressComponents = val.address_components;
          })
          .then(() => getPolygonDeliveryAreas(restaurantId))
          .then((deliveryAreas) => {
            const properAreas = deliveryAreas.filter((deliveryArea) => (
              containsPoint(destinationCords, deliveryArea.polygon) ? deliveryArea : null
            ));
            if (properAreas.length > 0) {
              const finalArea = properAreas.reduce((prev, curr) => (
                prev.price < curr.price ? prev : curr
              ));

              res.status(200).json({
                message: 'Delivery Price Polygon',
                price: finalArea.price,
                addressComponents,
                address
              });
            }
          });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
