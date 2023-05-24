const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products newcomments
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data - new comments
  Product.findAll({
    include: [
      Category, {
        model: Tag,
        through: ProductTag,
      },
    ]
  })
    .then((products) => res.json(products))
    .catch((err) => {
      console.log(err)
      res.status(500).json(err)
    })

});

// get one product newcomments
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data - new comments
  Product.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      Category,
      {
        model: Tag,
        through: ProductTag,
      }
    ],
  })
    .then((products) => res.json(products))
    .catch((err) => {
      console.log(err)
      res.status(400).json(err)
    })
});

// create new product 
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
// update product working with tagids or no
router.put('/:id', (req, res) => {
  // update product data 
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then(async () => {
      // check if array of products tagIds were sent
      if (req.body.tagIds && req.body.tagIds.length) {
        // Find all of the tags for the product
        const productTags = await ProductTag.findAll({
          where: { product_id: req.params.id }
        });
        // transform the product tag data
        const productTagIds = productTags.map(({ tag_id }) => tag_id);

        /* When updating product tags, the array sent over may contain new tag_ids 
           and it may also be void of tag_ids that used to be there.
           We have to account for both situations:  */

        // create filtered list of new tag_ids
        const newProductTags = req.body.tagIds
          // filter where the tag_ids coming over are not already in the current tag list
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });
        // figure out which ones to remove
        const productTagsToRemove = productTags
          // filter where the current tag list has tags that are not present in the new tag list coming over
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
        // run both actions asynchronously
        Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
        return res.json("Successfully updated with updated product tags")
      }
      return res.json("Successfully updated (no product tags included)");
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value - new comments
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((products) => {
      console.log(products)
      res.json(products)
    })
    .catch((err) => {
      res.status(400).json(err)
    })
});

module.exports = router;
