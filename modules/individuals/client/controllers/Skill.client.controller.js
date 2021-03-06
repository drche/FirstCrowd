(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('SkillsController', SkillsController);

  SkillsController.$inject = ['$scope', '$state', 'IndividualsService', 'Authentication', 'Notification'];

  function SkillsController ($scope, $state, IndividualsService, Authentication, Notification) {
    var vm = this;
    
    vm.skills = [];
    vm.addSkill = addSkill;
    vm.removeSkill = removeSkill;
    
    IndividualsService.getIndividual().$promise
      .then(function(data) {
        var skills = data.skills;
        for (var i = 0; i < skills.length; ++i) {
          addSkill();
          vm.skills[i] = skills[i];
          vm.skills[i].skill = skills[i].skill;
          if (skills[i].firstUsed)
            vm.skills[i].firstUsed = new Date(skills[i].firstUsed);
          if (skills[i].lastUsed)
            vm.skills[i].lastUsed = new Date(skills[i].lastUsed);
          if (skills[i].locationLearned.length > 0)
            vm.skills[i].locationLearned = skills[i].locationLearned.join(', ');
        }
      });
    
    function addSkill() {
      vm.skills.push({});
    }
    
    function removeSkill(index) {
      vm.skills.splice(index, 1);
    }
    
    vm.updateIndividualSkills = updateIndividualSkills;

    // Update a user profile
    function updateIndividualSkills(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.skillsForm');
        Notification.error({ message: 'Fill out required fields!' });
        return false;
      }
      
      IndividualsService.updateSkillsFromForm(vm.skills)
        .then(onUpdateSkillsSuccess)
        .catch(onUpdateSkillsError);
    }
    
    function onUpdateSkillsSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Skills updated!' });
    }
    
    function onUpdateSkillsError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Skills not updated!' });
    }
  }
}());
