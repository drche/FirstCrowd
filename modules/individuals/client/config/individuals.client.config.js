(function () {
  'use strict';

  angular
    .module('individuals')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Individuals',
      state: 'individuals',
      type: 'dropdown',
      userRole: 'individual'
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'List Individuals',
      state: 'individuals.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Create Individual',
      state: 'individuals.create',
      userRole: 'individual'
    });
  }
}());
