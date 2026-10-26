// Deliberately enumerate deployable files. New files require review of this list.
export const policy = Object.freeze({
  theme: {source:'themes/vibelab', slug:'vibelab', header:'style.css', files:[
    'archive-vne_resource.php','archive-vne_guide.php','guides.php','catalog-template.php','catalog.php','detail.php',
    'discovery-template.php','discovery.php','footer.php','front-page.php','functions.php',
    'header.php','index.php','lesson-template.php','lesson.php','seo.php',
    'single-vne_resource.php','style.css','support-template.php','support.php',
    'taxonomy-vne_category.php','taxonomy-vne_need.php','taxonomy-vne_tool.php',
    'assets/cover-astro.svg','assets/cover-default.svg','assets/cover-mdn.svg',
    'assets/cover-pico.svg','assets/cover-react.svg','assets/cover-web-basics.svg',
    'assets/cover-web-design.svg','assets/discovery.js','assets/lesson.css','assets/lesson.js',
    'assets/menu.js','assets/moc-studio/index.html','assets/moc-studio/style.css',
    'assets/support.css','assets/support.js'
  ].sort()},
  plugin: {source:'plugins/vne-library-core', slug:'vne-library-core', header:'vne-library-core.php', files:[
    'admin.php','api.php','cache.php','model.php','reports.php','revision-admin.php',
    'revisions.php','state-admin.php','state.php','vne-library-core.php'
  ].sort()}
});
export const previousThemeRef='4e80391d906e20f645ca02f819644045a274123c';
export const releaseContract={theme:'0.7.0',plugin:'0.4.2',schema:3,previousTheme:'0.6.0'};
