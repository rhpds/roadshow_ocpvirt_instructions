'use strict'

module.exports.register = function ({ config }) {
  this.once('contentClassified', ({ playbook, contentCatalog }) => {
    var pageDetails = {}
    console.log('site-wide attributes (as defined in playbook)')
    console.log(playbook.asciidoc.attributes)
    let fileContents = "== Site Wide Attributes\n\n"
    fileContents += `${playbook.asciidoc.attributes || {}}\n`
    contentCatalog.getComponents().forEach((component) => {
      component.versions.forEach((componentVersion) => {
        getUniqueOrigins(contentCatalog, componentVersion).forEach((origin) => {
          console.log(`${componentVersion.version}@${componentVersion.name} attributes (as defined in antora.yml)`)
          pageDetails = { version: `${componentVersion.version}`, name: `${componentVersion.name}` }
          console.log(origin.descriptor.asciidoc?.attributes || {})
          fileContents += `== Component Wide Attributes\n\n`
          fileContents += `Antora component version@name: \`${componentVersion.version}@${componentVersion.name}\`\n\n`
          fileContents += `[source,json]\n----\n`
          fileContents += JSON.stringify(origin.descriptor.asciidoc?.attributes || {}, null, 2)
          fileContents += `\n----\n`
        })
      })
    })
    const newPage = contentCatalog.addFile({
      contents: Buffer.from('= Attributes Page\n\nTo disable Dev Mode (this page) comment out the dev-mode.js extenion in the playbook (usually default-site.yml)\n\n' + fileContents),
      path: 'modules/ROOT/pages/attrs-page.adoc',
      src: {
        path: 'modules/ROOT/pages/attrs-page.adoc',
        component: pageDetails.name,
        version: pageDetails.version,
        // component: pageDetails.name || 'modules',
        // version: pageDetails.version || 'master',
        module: 'ROOT',
        family: 'page',
        relative: 'attrs-page.adoc',
      },
    })
  })
  // add new page to navigation
  this.on('navigationBuilt', ({ contentCatalog }) => {
    const { addToNavigation = true, devPagesHeading = 'Dev Mode' } = config
    const logger = this.getLogger('dev-pages-extension')
      contentCatalog.getComponents().forEach(({ versions }) => {
        versions.forEach(({ name: component, version, navigation: nav, url: defaultUrl }) => {
          const navEntriesByUrl = getNavEntriesByUrl(nav)
          const unlistedPages = contentCatalog
            .findBy({ component, version, family: 'page' })
            .filter((page) => page.out)
            .reduce((collector, page) => {
              if ((page.pub.url in navEntriesByUrl) || page.pub.url === defaultUrl) return collector
              // logger.warn({ file: page.src, source: page.src.origin }, 'detected unlisted dev page')
              return collector.concat(page)
            }, [])
          if (unlistedPages.length && addToNavigation) {
            nav.push({
              content: devPagesHeading,
              items: unlistedPages.map((page) => {
                // logger.warn({ content: page, url: page.pub.url }, 'unlisted dev page details')
                const navtitle = page.asciidoc.navtitle || page.src.stem
                return { content: navtitle, url: page.pub.url, urlType: 'internal' }
              }),
              root: true,
          })
        }
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

function getNavEntriesByUrl (items = [], accum = {}) {
  items.forEach((item) => {
    if (item.urlType === 'internal') accum[item.url.split('#')[0]] = item
    getNavEntriesByUrl(item.items, accum)
  })
  return accum
}
