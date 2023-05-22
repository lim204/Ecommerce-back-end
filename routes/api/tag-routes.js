const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data -new comments
  Tag.findAll({
    include: [{
      model: Product,
      through: ProductTag,
      }
    ],
  })
  .then((tags)=> res.status(200).json(tags))
  .catch ((err)=> res.status(500).json(err))
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data -new comments
    Tag.findOne({
      where:{
        id:req.params.id,
      },
      include: [{
        model: Product,
        through: ProductTag,
        }
      ],
    })
    .then((tag)=> res.status(200).json(tag))
    .catch ((err)=> res.status(404).json(err))
});

router.post('/', (req, res) => {
  // create a new tag - new comment
  Tag.create(req.body)
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value -new comments
  Tag.update(req.body,{
    where: {
      id: req.params.id,
    },
  })

});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value -new notes
  Tag.destroy({
    where:{
      id:req.params.id,
    },
  })

});

module.exports = router;
