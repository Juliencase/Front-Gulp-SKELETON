const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps');
const config = require('./appconfig.json');



function browserSync(done) {
    browsersync.init({
        server: ['app', 'dist'],
        port: config.server.port
    });
    done();
};

function browserSyncReload(done) {
    browsersync.reload();
    done();
}

function css() {
    return gulp.src('./sass/**/*.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browsersync.stream());
}

function typescript() {
    const task = tsProject.src()
    .pipe(tsProject());

    return task.js
    .pipe(gulp.dest(tsProject.options.outDir));
}

function scripts() {
    return gulp.src([
        './node_modules/systemjs/dist/system.js',
        './node_modules/systemjs/dist/extras/named-register.js',
        './dist/js/main.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(tsProject.options.outDir))
    .pipe(uglify())
    .pipe(rename({
        suffix : '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(tsProject.options.outDir))
    .pipe(browsersync.stream())
}

function watchFiles() {
    gulp.watch('./sass/**/*.scss', css);
    gulp.watch('./src/**/*.ts', gulp.series(typescript, scripts));
    gulp.series(browserSyncReload);
}

gulp.task('hello', done => {
    console.log('Hello Gulp');
    done();
});



gulp.task('css', css);
gulp.task('ts', typescript, scripts);
gulp.task('build', gulp.series(css, typescript, scripts))
gulp.task('watch', gulp.parallel(watchFiles, browserSync));