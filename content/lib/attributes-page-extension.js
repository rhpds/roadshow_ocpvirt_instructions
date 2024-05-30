module.exports.register = function ({ config }) {
  this.once('contentClassified', ({ contentCatalog }) => {
    const newPage = contentCatalog.addFile({
      contents: Buffer.from('= New Page\n\nThis is the contents of a generated page.'),
      path: 'content/modules/ROOT/pages/new-page.adoc',
      src: {
        path: 'content/modules/ROOT/pages/new-page.adoc',
        component: 'antora',
        version: '3.1',
        module: 'ROOT',
        family: 'page',
        relative: 'new-page.adoc',
      },
    })
  })
}
