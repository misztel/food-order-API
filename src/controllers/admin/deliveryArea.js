const { validationResult } = require('express-validator');
const { PolyUtil } = require('node-geometry-library');

const axios = require('axios');

const DeliveryArea = require('../../models/deliveryArea');
const DeliveryAreaItem = require('../../models/deliveryAreaItem');
const Restaurant = require('../../models/restaurant');

exports.getDeliveryAreas = (req, res, next) => {
  const { restaurantId } = req.params;

  DeliveryArea.findOne({ restaurantId }).populate('deliveryAreaItems')
    .then((data) => {
      if (!data) {
        res.status(200).json({
          message: 'Delivery Areas fetched succesfully',
          data: {}
        });
      } else {
        res.status(200).json({
          message: 'Delivery Areas fetched succesfully',
          data
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

exports.addDeliveryArea = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    restaurantId
  } = req.body;

  const deliveryArea = new DeliveryArea({
    type: 'circle',
    restaurantId
  });

  deliveryArea.save()
    .then((result) => {
      Restaurant.findOne({ _id: restaurantId }, (err, restaurant) => {
        if (restaurant) {
          restaurant.deliveryAreas.push(deliveryArea);
          restaurant.save();
          res.status(201).json({
            message: 'Delivery area created!',
            deliveryArea: result
          });
        }
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteDeliveryArea = (req, res, next) => {
  const { deliveryAreaId } = req.params;

  DeliveryArea.findById(deliveryAreaId)
    .then((deliveryArea) => {
      if (!deliveryArea) {
        const error = new Error('Could not find delivery area');
        error.statusCode = 404;
        throw error;
      }
      return DeliveryArea.findByIdAndRemove(deliveryAreaId);
    })
    .then((result) => {
      res.status(200).json({
        message: 'Delivery Area deleted successfully',
        deliveryAreaId: result._id
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateDeliveryAreaType = (req, res, next) => {
  const { deliveryAreaId } = req.params;

  const { areaType } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  DeliveryArea.findById(deliveryAreaId).populate('deliveryAreaItems')
    .then((deliveryArea) => {
      if (!deliveryArea) {
        const error = new Error('Could not find Delivery Area');
        error.statusCode = 404;
        throw error;
      }

      deliveryArea.type = areaType || deliveryArea.type;

      return deliveryArea.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Category data updated successfully',
        deliveryArea: result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addCircleArea = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    deliveryAreaId,
    radius,
    price
  } = req.body;

  const deliveryAreaItem = new DeliveryAreaItem({
    radius,
    price,
    deliveryAreaId
  });

  deliveryAreaItem.save()
    .then((result) => {
      DeliveryArea.findOne({ _id: deliveryAreaId }, (err, deliveryArea) => {
        if (deliveryArea) {
          deliveryArea.deliveryAreaItems.push(deliveryAreaItem);
          deliveryArea.save()
            .then((savedArea) => {
              DeliveryArea.findById(deliveryAreaId).populate('deliveryAreaItems')
                .then((data) => {
                  res.status(201).json({
                    message: 'Cricle area created!',
                    deliveryArea: data
                  });
                });
            });
        }
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteDeliveryAreaItem = (req, res, next) => {
  const { deliveryAreaItemId } = req.params;

  DeliveryAreaItem.findById(deliveryAreaItemId)
    .then((deliveryAreaItem) => {
      if (!deliveryAreaItem) {
        const error = new Error('Could not find delivery area item');
        error.statusCode = 404;
        throw error;
      }
      return DeliveryAreaItem.findByIdAndRemove(deliveryAreaItemId);
    })
    .then((result) => {
      DeliveryArea.findById(result.deliveryAreaId).populate('deliveryAreaItems')
        .then((deliveryArea) => {
          if (!deliveryArea) {
            const error = new Error('Could not find delivery area item');
            error.statusCode = 404;
            throw error;
          }
          res.status(200).json({
            message: 'Delivery Area Item deleted successfully',
            deliveryArea
          });
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addPolygonArea = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    deliveryAreaId,
    name,
    polygon,
    price
  } = req.body;

  const deliveryAreaItem = new DeliveryAreaItem({
    name,
    price,
    polygon,
    deliveryAreaId
  });

  deliveryAreaItem.save()
    .then((result) => {
      DeliveryArea.findOne({ _id: deliveryAreaId }, (err, deliveryArea) => {
        if (deliveryArea) {
          deliveryArea.deliveryAreaItems.push(deliveryAreaItem);
          deliveryArea.save()
            .then((savedArea) => {
              DeliveryArea.findById(deliveryAreaId).populate('deliveryAreaItems')
                .then((data) => {
                  res.status(201).json({
                    message: 'Cricle area created!',
                    deliveryArea: data
                  });
                });
            });
        }
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePolygonArea = (req, res, next) => {
  const { deliveryAreaItemId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  DeliveryAreaItem.findById(deliveryAreaItemId)
    .then((deliveryAreaItem) => {
      if (!deliveryAreaItem) {
        const error = new Error('Could not find Delivery Area item');
        error.statusCode = 404;
        throw error;
      }

      deliveryAreaItem.polygon = req.body.polygon || deliveryAreaItem.polygon;

      return deliveryAreaItem.save();
    })
    .then((savedArea) => {
      DeliveryArea.findById(savedArea.deliveryAreaId).populate('deliveryAreaItems')
        .then((data) => {
          res.status(201).json({
            message: 'Delivery area item polygon updated!',
            deliveryArea: data
          });
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.checkDelivery = (req, res, next) => {
  const {
    placeId: deliveryPlaceId,
    restaurantId
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

  const getDestinationCords = (url) => (
    axios.get(url)
      .then((response) => response.data.result.geometry.location)
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      })
  );

  const getPointsCords = (restaurantPlaceId, destinationPlaceId) => {
    console.log(restaurantPlaceId, destinationPlaceId);
    const restaurantCordsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${restaurantPlaceId}&key=${process.env.GOOGLE_API_KEY}`;
    const destinationCordsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${destinationPlaceId}&key=${process.env.GOOGLE_API_KEY}`;

    const getRestaurantCords = (url) => (
      axios.get(url)
        .then((response) => response.data.result.geometry.location)
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
      .then(() => getDestinationCords(destinationCordsUrl))
      .then((destinationCords) => { cords.destinationCords = destinationCords; })
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
    console.log(distance, deliveryAreaItems);
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
                  val
                });
              })
              .catch((err) => {
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              });
          });
      } else if (type === 'polygon') {
        let destinationCords = {};

        getDestinationCords(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${deliveryPlaceId}&key=${process.env.GOOGLE_API_KEY}`)
          .then((val) => { destinationCords = val; })
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
                price: finalArea.price
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
