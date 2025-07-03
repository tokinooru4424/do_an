import Route from '@core/Routes'
import PermissionMiddleware from '@app/Middlewares/PermissionMiddleware';

const ExtendMiddleware = require("@app/Middlewares/ExtendMiddleware");
const AuthApiMiddleware = require('@app/Middlewares/AuthApiMiddleware');
const multer = require('multer')

const upload = multer();
const { permissionResource, permission } = PermissionMiddleware

Route.group(() => {
  // ---------------------------------- Auth Routes ---------------------------------------//
  Route.post("/login", "AuthController.login").name('auth.login')
  Route.post("/forgotPassword", "AuthController.forgotPassword").name('auth.forgotPassword')
  Route.get("/checkToken/:token", "AuthController.checkToken").name('auth.checkToken')
  Route.post("/resetPassword", "AuthController.resetPassword").name('auth.resetPassword')

  // ---------------------------------- End Auth Routes -----------------------------------//

  // ---------------------------------- Route Routes ---------------------------------------//
  Route.get("/routes", "RouteController.index").name('routes.index')
  // ---------------------------------- End Route Routes -----------------------------------//

  // Route GET /movies (public, không cần AuthApiMiddleware)
  Route.get("/movies", "MovieController.index").name('movies.index');

  Route.group(() => {
    Route.post("/changePassword", "AuthController.changePassword").name("auth.changePassword")
    Route.post("/logout", "AuthController.logout").name('auth.logout')
    Route.post("/refreshToken", "AuthController.refreshToken").name('auth.refreshToken')
    // ---------------------------------- User Routes ---------------------------------------//
    Route.resource("/users", "UserController").name('users').middleware([
      permissionResource(['users'])
    ])
    Route.get("/users/getInfo", "UserController.getInfo").name('users.getInfo').middleware([
      permission({ 'users': 'R' })
    ])
    Route.post("/users/importExcel", "UserController.importExcel").name('users.importExcel').middleware([
      permission({ 'users': 'C' })
    ])
    // ---------------------------------- End User Routes -----------------------------------//

    // ---------------------------------- Role Permission Routes ---------------------------------------//
    Route.get("/rolePermissions/getPermissionByRoleId", "RolePermissionController.getPermissionByRoleId").name('rolePermissions.getPermissionByRoleId').middleware([
      permission({ 'roles': 'R' })
    ])
    Route.put("/rolePermissions/update", "RolePermissionController.update").name('rolePermissions.update').middleware([
      permission({ 'roles': 'U' })
    ])
    // ---------------------------------- End Role Permission Routes -----------------------------------//

    // ---------------------------------- Role Routes ---------------------------------------//
    Route.resource("/roles", "RoleController").name('roles').middleware([
      permissionResource(['roles'])
    ])
    Route.get("/roles/select2", "RoleController.select2").name('roles.select2').middleware([
      permission({ 'roles': 'R' })
    ])
    Route.get("/roles/selectParent", "RoleController.selectParent").name('roles.selectParent').middleware([
      permission({ 'roles': 'R' })
    ])
    // ---------------------------------- End Role Routes -----------------------------------//

    // ---------------------------------- Cinema Routes ---------------------------------------//
    Route.resource("/cinemas", "CinemaController").name('cinemas').middleware([
      permissionResource(['cinemas'])
    ])
    Route.get("/cinemas/select2", "CinemaController.select2").name('cinemas.select2').middleware([
      permission({ 'cinemas': 'R' })
    ])
    // ---------------------------------- End Cinema Routes -----------------------------------//

    // ---------------------------------- Hall Routes ---------------------------------------//
    Route.resource("/halls", "HallController").name('halls').middleware([
      permissionResource(['halls'])
    ])
    Route.get("/halls/select2", "HallController.select2").name('halls.select2').middleware([
      permission({ 'halls': 'R' })
    ])
    // ---------------------------------- End Hall Routes -----------------------------------//

    // ---------------------------------- Showtime Routes ---------------------------------------//
    Route.resource("/showtimes", "ShowTimeController").name('showtimes').middleware([
      permissionResource(['showtimes'])
    ])
    Route.get("/showtimes/select2", "ShowTimeController.select2").name('showtimes.select2').middleware([
      permission({ 'showtimes': 'R' })
    ])
    // ---------------------------------- Showtime Hall Routes -----------------------------------//

    // ---------------------------------- Movie Routes ---------------------------------------//
    Route.resource("/movies", "MovieController").name('movies').middleware([
      permissionResource(['movies'])
    ])
    Route.get("/movies/select2", "MovieController.select2").name('movies.select2').middleware([
      permission({ 'movies': 'R' })
    ])
    // ---------------------------------- MovieHall Routes -----------------------------------//

    // Thêm route upload ảnh
    Route.post("/upload", "UploadController.upload").name('upload.upload').middleware([upload.single('files')]);
    // ---------------------------------- End Routes -----------------------------------//
  }).middleware([AuthApiMiddleware])
}).middleware([ExtendMiddleware]).name('api').prefix("/api/v1")

