import gutil from 'gulp-util';

export default {

  port: {
    dev: 8080,
    dist: 8081
  },

  path: {
    js: {
      files: 'public/**/*.js',
      entry: 'public/app.js',
      copy: ['public/jspm_packages/system.js', 'config.js'],
      jspm: 'public/jspm_packages/**/*'
    },
    sass: {
      files: 'public/**/*.scss'
    },
    html: {
      files: 'public/index.html'
    },
    tests: {
      files: 'karma.conf.js'
    }
  },

  dev: {
    dir: 'dev',
    js: 'dev/js',
    css: 'dev/css',
    html: 'dev',
    jspm: 'dev/jspm_packages'
  },

  dist: {
    dir: 'dist',
    js: 'dist/js',
    css: 'dist/css',
    html: 'dist'
  },

  htmlReplace: {
    'js': ['js/bundle.js', 'js/system.js', 'js/config.js'],
    'css': 'css/bundle.css'
  },

  handleError: gutil.log,
};

