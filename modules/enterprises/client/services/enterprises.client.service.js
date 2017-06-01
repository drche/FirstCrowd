// Enterprises service used to communicate Enterprises REST endpoints
(function () {
  'use strict';

  angular
    .module('enterprises')
    .factory('EnterprisesService', EnterprisesService);

  EnterprisesService.$inject = ['$resource'];

  function EnterprisesService($resource) {
    var Enterprises = $resource('api/enterprises/:enterpriseId', {
      enterpriseId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      updateProfile: {
        method: 'POST',
        url: 'api/enterprises/profile/'
      },
      updateSuppliers: {
        method: 'POST',
        url: 'api/enterprises/suppliers/'
      },
      updateCompetitors: {
        method: 'POST',
        url: 'api/enterprises/competitors/'
      },
      updateCustomers: {
        method: 'POST',
        url: 'api/enterprises/customers/'
      },
      getEnterpriseItems: {
        method: 'GET',
        url: 'api/enterprises/getEnterprise'
      }
    });

    angular.extend(Enterprises, {
      updateProfileFromForm: function (profile) {
        return this.updateProfile(profile).$promise;
      },
      updateSuppliersFromForm: function (suppliers) {
        return this.updateSuppliers(suppliers).$promise;
      },
      updateCustomersFromForm: function (customers) {
        return this.updateCustomers(customers).$promise;
      },
      updateCompetitorsFromForm: function (competitors) {
        return this.updateCompetitors(competitors).$promise;
      },
      getEnterprise: function () {
        return this.getEnterpriseItems().$promise;
      }
    });

    return Enterprises;
  }
}());
