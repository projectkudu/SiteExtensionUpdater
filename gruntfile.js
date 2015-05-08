module.exports = function(grunt) {
    grunt.initConfig({
	  uglify: {
	    my_target: {
	      files: {
	        'siteExtensionUpdater.min.js': ['siteExtensionUpdater.js']
	      }
	    }
	  }
	});

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify']);
};