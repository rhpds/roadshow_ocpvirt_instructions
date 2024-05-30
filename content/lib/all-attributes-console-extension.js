module.exports.register = function () {
  this.once('contentClassified', ({ playbook, contentCatalog }) => {
    const newPage = contentCatalog.addFile({
      contents: Buffer.from('= New Page\n\nThis is the contents of a generated page.'),
      path: 'content/modules/ROOT/pages/new-page.adoc',
      version: '3.1',
      src: {
        path: 'content/modules/ROOT/pages/new-page.adoc',
        component: 'antora',
        version: '3.1',
        module: 'ROOT',
        family: 'page',
        relative: 'new-page.adoc',
      },})
    console.log('site-wide attributes (as defined in playbook)')
    console.log(playbook.asciidoc.attributes)
    contentCatalog.getComponents().forEach((component) => {
      component.versions.forEach((componentVersion) => {
        getUniqueOrigins(contentCatalog, componentVersion).forEach((origin) => {
          console.log(`${componentVersion.version}@${componentVersion.name} attributes (as defined in antora.yml)`)
          console.log(origin.descriptor.asciidoc?.attributes || {})
        })
      })
    })
  })
}

function getUniqueOrigins (contentCatalog, componentVersion) {
  return contentCatalog.findBy({ component: componentVersion.name, version: componentVersion.version })
    .reduce((origins, file) => {
      const origin = file.src.origin
      if (origin && !origins.includes(origin)) origins.push(origin)
      return origins
    }, [])
}
