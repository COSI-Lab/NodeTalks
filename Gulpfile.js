var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass');

gulp.task('lint', () => {
	return gulp.src('./index.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('sass', () => {
	return gulp.src("./sass/app.scss")
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(gulp.dest("./public/css"));
})
