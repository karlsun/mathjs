module.exports = function (math) {
  var util = require('../../util/index'),

      Complex = require('../../type/Complex'),
      collection = require('../../type/collection'),

      object = util.object,
      isNumber = util.number.isNumber,
      isBoolean = util.boolean.isBoolean,
      isCollection = collection.isCollection,
      isComplex = Complex.isComplex;

  /**
   * Get the real part of a complex number.
   *
   *     re(x)
   *
   * For matrices, the function is evaluated element wise.
   *
   * @param {Number | Complex | Array | Matrix | Boolean} x
   * @return {Number | Array | Matrix} re
   */
  math.re = function re(x) {
    if (arguments.length != 1) {
      throw new util.error.ArgumentsError('re', arguments.length, 1);
    }

    if (isNumber(x)) {
      return x;
    }

    if (isComplex(x)) {
      return x.re;
    }

    if (isCollection(x)) {
      return collection.deepMap(x, re);
    }

    if (isBoolean(x)) {
      return +x;
    }

    // return a clone of the value itself for all non-complex values
    return object.clone(x);
  };
};