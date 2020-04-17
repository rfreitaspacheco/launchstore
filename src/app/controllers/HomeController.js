const Product = require("../models/Product");

const { formatPrice } = require("../../lib/utils");

module.exports = {
  async index(req, res) {
    try {
      let products = await Product.findall();

      if (!products) return res.send("Não há produtos!");

      async function getImage(productId) {
        let files = await Product.files(productId);
        files = files.map(
          (file) =>
            `${req.protocol}://${req.headers.host}${file.path.replace(
              "public",
              ""
            )}`
        );
        return files[0];
      }

      const productsPromise = products
        .map(async (product) => {
          product.img = await getImage(product.id);
          product.old_price = formatPrice(product.old_price);
          product.price = formatPrice(product.price);
          return product;
        })
        .filter((product, index) => (index > 2 ? false : true));

      const lastAdded = await Promise.all(productsPromise);

      return res.render("home/index", { products: lastAdded });
    } catch (err) {
      console.error(err);
    }
  },
};
