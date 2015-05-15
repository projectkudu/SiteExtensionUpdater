module.exports = function (grunt) {
  var projectPkj = grunt.file.readJSON('package.json');
  
  grunt.initConfig({
    pkg: projectPkj,
    uglify: {
      my_target: {
        files: {
          '<%= "bin/siteExtensionUpdater." + pkg.version + ".min.js" %>': ['src/siteExtensionUpdater.js']
        }
      }
    },
    copy: {
    main: {
      src: 'src/siteExtensionUpdater.js',
      dest: '<%= "bin/siteExtensionUpdater." + pkg.version + ".js" %>',
      options: {
      process: function (content, srcpath) {
        return content.replace(/{projectVersion}/, projectPkj.version); // Set the version number correctly in the header
      },
    },
    },
  },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify', 'copy']);
};