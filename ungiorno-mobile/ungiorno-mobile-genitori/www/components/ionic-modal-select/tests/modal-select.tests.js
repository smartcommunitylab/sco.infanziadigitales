describe('modal-select directive', function(){

  var elm, elmScope, scope, modalInstance;

  var $document;

  beforeEach(module('ionic'));
  beforeEach(module('ionic-modal-select'));
  
  beforeEach(inject(function($rootScope, $compile) {
        elm = angular.element([
            '<button class="button button-positive" modal-select ng-model="someModel" options="selectables" modal-title="Select a number">',
                'Select it',
                '<div class="option">',
                    '<a class="oo">{{option}}<a>',
                '</div>',
            '</button>'
        ].join(''));

        scope = $rootScope;
        scope.someModel = null;
        scope.selectables = [1,2,3];

        
        $compile(elm)(scope);
        scope.$digest()
        
        elmScope = elm.isolateScope()
        modalInstance = elmScope.modal;
  
    }));


    it('should have modal attached', function(){
        expect(modalInstance.viewType).toBe('modal');
        var modalElement = modalInstance.$el;
        //console.log(modalElement)

        //var oos = angular.element(modalElement.eq(0))
        //console.log(oos)
        //expect(oos.length).toBeEqual(3);
        //modal template
        /*
        var modal = $document.find("ion-modal-view");
        expect(modal.length).toBe(1);
        expect(angular.element(modal[0]).hasClass('active')).toBe(true);
        
        
        expect(angular.element(modal[0]).hasClass('active')).toBe(false);
        */
            
        
        
    });

    
    

});