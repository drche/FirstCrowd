(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseProfileController', EnterpriseProfileController);

  EnterpriseProfileController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseProfileController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;
    vm.saveProfile = saveProfile;

    vm.ret = {
      profile:{
        companyAddress:{}
      }
    };

    autopopulateForms();

    vm.countryList = [
      { name: 'Afghanistan', code: 'AF' },
      { name: 'Åland Islands', code: 'AX' },
      { name: 'Albania', code: 'AL' },
      { name: 'Algeria', code: 'DZ' },
      { name: 'American Samoa', code: 'AS' },
      { name: 'AndorrA', code: 'AD' },
      { name: 'Angola', code: 'AO' },
      { name: 'Anguilla', code: 'AI' },
      { name: 'Antarctica', code: 'AQ' },
      { name: 'Antigua and Barbuda', code: 'AG' },
      { name: 'Argentina', code: 'AR' },
      { name: 'Armenia', code: 'AM' },
      { name: 'Aruba', code: 'AW' },
      { name: 'Australia', code: 'AU' },
      { name: 'Austria', code: 'AT' },
      { name: 'Azerbaijan', code: 'AZ' },
      { name: 'Bahamas', code: 'BS' },
      { name: 'Bahrain', code: 'BH' },
      { name: 'Bangladesh', code: 'BD' },
      { name: 'Barbados', code: 'BB' },
      { name: 'Belarus', code: 'BY' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Belize', code: 'BZ' },
      { name: 'Benin', code: 'BJ' },
      { name: 'Bermuda', code: 'BM' },
      { name: 'Bhutan', code: 'BT' },
      { name: 'Bolivia', code: 'BO' },
      { name: 'Bosnia and Herzegovina', code: 'BA' },
      { name: 'Botswana', code: 'BW' },
      { name: 'Bouvet Island', code: 'BV' },
      { name: 'Brazil', code: 'BR' },
      { name: 'British Indian Ocean Territory', code: 'IO' },
      { name: 'Brunei Darussalam', code: 'BN' },
      { name: 'Bulgaria', code: 'BG' },
      { name: 'Burkina Faso', code: 'BF' },
      { name: 'Burundi', code: 'BI' },
      { name: 'Cambodia', code: 'KH' },
      { name: 'Cameroon', code: 'CM' },
      { name: 'Canada', code: 'CA' },
      { name: 'Cape Verde', code: 'CV' },
      { name: 'Cayman Islands', code: 'KY' },
      { name: 'Central African Republic', code: 'CF' },
      { name: 'Chad', code: 'TD' },
      { name: 'Chile', code: 'CL' },
      { name: 'China', code: 'CN' },
      { name: 'Christmas Island', code: 'CX' },
      { name: 'Cocos (Keeling) Islands', code: 'CC' },
      { name: 'Colombia', code: 'CO' },
      { name: 'Comoros', code: 'KM' },
      { name: 'Congo', code: 'CG' },
      { name: 'Congo, The Democratic Republic of the', code: 'CD' },
      { name: 'Cook Islands', code: 'CK' },
      { name: 'Costa Rica', code: 'CR' },
      { name: 'Cote D\'Ivoire', code: 'CI' },
      { name: 'Croatia', code: 'HR' },
      { name: 'Cuba', code: 'CU' },
      { name: 'Cyprus', code: 'CY' },
      { name: 'Czech Republic', code: 'CZ' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Djibouti', code: 'DJ' },
      { name: 'Dominica', code: 'DM' },
      { name: 'Dominican Republic', code: 'DO' },
      { name: 'Ecuador', code: 'EC' },
      { name: 'Egypt', code: 'EG' },
      { name: 'El Salvador', code: 'SV' },
      { name: 'Equatorial Guinea', code: 'GQ' },
      { name: 'Eritrea', code: 'ER' },
      { name: 'Estonia', code: 'EE' },
      { name: 'Ethiopia', code: 'ET' },
      { name: 'Falkland Islands (Malvinas)', code: 'FK' },
      { name: 'Faroe Islands', code: 'FO' },
      { name: 'Fiji', code: 'FJ' },
      { name: 'Finland', code: 'FI' },
      { name: 'France', code: 'FR' },
      { name: 'French Guiana', code: 'GF' },
      { name: 'French Polynesia', code: 'PF' },
      { name: 'French Southern Territories', code: 'TF' },
      { name: 'Gabon', code: 'GA' },
      { name: 'Gambia', code: 'GM' },
      { name: 'Georgia', code: 'GE' },
      { name: 'Germany', code: 'DE' },
      { name: 'Ghana', code: 'GH' },
      { name: 'Gibraltar', code: 'GI' },
      { name: 'Greece', code: 'GR' },
      { name: 'Greenland', code: 'GL' },
      { name: 'Grenada', code: 'GD' },
      { name: 'Guadeloupe', code: 'GP' },
      { name: 'Guam', code: 'GU' },
      { name: 'Guatemala', code: 'GT' },
      { name: 'Guernsey', code: 'GG' },
      { name: 'Guinea', code: 'GN' },
      { name: 'Guinea-Bissau', code: 'GW' },
      { name: 'Guyana', code: 'GY' },
      { name: 'Haiti', code: 'HT' },
      { name: 'Heard Island and Mcdonald Islands', code: 'HM' },
      { name: 'Holy See (Vatican City State)', code: 'VA' },
      { name: 'Honduras', code: 'HN' },
      { name: 'Hong Kong', code: 'HK' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Iceland', code: 'IS' },
      { name: 'India', code: 'IN' },
      { name: 'Indonesia', code: 'ID' },
      { name: 'Iran, Islamic Republic Of', code: 'IR' },
      { name: 'Iraq', code: 'IQ' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Isle of Man', code: 'IM' },
      { name: 'Israel', code: 'IL' },
      { name: 'Italy', code: 'IT' },
      { name: 'Jamaica', code: 'JM' },
      { name: 'Japan', code: 'JP' },
      { name: 'Jersey', code: 'JE' },
      { name: 'Jordan', code: 'JO' },
      { name: 'Kazakhstan', code: 'KZ' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Kiribati', code: 'KI' },
      { name: 'Korea, Democratic People\'S Republic of', code: 'KP' },
      { name: 'Korea, Republic of', code: 'KR' },
      { name: 'Kuwait', code: 'KW' },
      { name: 'Kyrgyzstan', code: 'KG' },
      { name: 'Lao People\'S Democratic Republic', code: 'LA' },
      { name: 'Latvia', code: 'LV' },
      { name: 'Lebanon', code: 'LB' },
      { name: 'Lesotho', code: 'LS' },
      { name: 'Liberia', code: 'LR' },
      { name: 'Libyan Arab Jamahiriya', code: 'LY' },
      { name: 'Liechtenstein', code: 'LI' },
      { name: 'Lithuania', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Macao', code: 'MO' },
      { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
      { name: 'Madagascar', code: 'MG' },
      { name: 'Malawi', code: 'MW' },
      { name: 'Malaysia', code: 'MY' },
      { name: 'Maldives', code: 'MV' },
      { name: 'Mali', code: 'ML' },
      { name: 'Malta', code: 'MT' },
      { name: 'Marshall Islands', code: 'MH' },
      { name: 'Martinique', code: 'MQ' },
      { name: 'Mauritania', code: 'MR' },
      { name: 'Mauritius', code: 'MU' },
      { name: 'Mayotte', code: 'YT' },
      { name: 'Mexico', code: 'MX' },
      { name: 'Micronesia, Federated States of', code: 'FM' },
      { name: 'Moldova, Republic of', code: 'MD' },
      { name: 'Monaco', code: 'MC' },
      { name: 'Mongolia', code: 'MN' },
      { name: 'Montserrat', code: 'MS' },
      { name: 'Morocco', code: 'MA' },
      { name: 'Mozambique', code: 'MZ' },
      { name: 'Myanmar', code: 'MM' },
      { name: 'Namibia', code: 'NA' },
      { name: 'Nauru', code: 'NR' },
      { name: 'Nepal', code: 'NP' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'Netherlands Antilles', code: 'AN' },
      { name: 'New Caledonia', code: 'NC' },
      { name: 'New Zealand', code: 'NZ' },
      { name: 'Nicaragua', code: 'NI' },
      { name: 'Niger', code: 'NE' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'Niue', code: 'NU' },
      { name: 'Norfolk Island', code: 'NF' },
      { name: 'Northern Mariana Islands', code: 'MP' },
      { name: 'Norway', code: 'NO' },
      { name: 'Oman', code: 'OM' },
      { name: 'Pakistan', code: 'PK' },
      { name: 'Palau', code: 'PW' },
      { name: 'Palestinian Territory, Occupied', code: 'PS' },
      { name: 'Panama', code: 'PA' },
      { name: 'Papua New Guinea', code: 'PG' },
      { name: 'Paraguay', code: 'PY' },
      { name: 'Peru', code: 'PE' },
      { name: 'Philippines', code: 'PH' },
      { name: 'Pitcairn', code: 'PN' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Puerto Rico', code: 'PR' },
      { name: 'Qatar', code: 'QA' },
      { name: 'Reunion', code: 'RE' },
      { name: 'Romania', code: 'RO' },
      { name: 'Russian Federation', code: 'RU' },
      { name: 'RWANDA', code: 'RW' },
      { name: 'Saint Helena', code: 'SH' },
      { name: 'Saint Kitts and Nevis', code: 'KN' },
      { name: 'Saint Lucia', code: 'LC' },
      { name: 'Saint Pierre and Miquelon', code: 'PM' },
      { name: 'Saint Vincent and the Grenadines', code: 'VC' },
      { name: 'Samoa', code: 'WS' },
      { name: 'San Marino', code: 'SM' },
      { name: 'Sao Tome and Principe', code: 'ST' },
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'Senegal', code: 'SN' },
      { name: 'Serbia and Montenegro', code: 'CS' },
      { name: 'Seychelles', code: 'SC' },
      { name: 'Sierra Leone', code: 'SL' },
      { name: 'Singapore', code: 'SG' },
      { name: 'Slovakia', code: 'SK' },
      { name: 'Slovenia', code: 'SI' },
      { name: 'Solomon Islands', code: 'SB' },
      { name: 'Somalia', code: 'SO' },
      { name: 'South Africa', code: 'ZA' },
      { name: 'South Georgia and the South Sandwich Islands', code: 'GS' },
      { name: 'Spain', code: 'ES' },
      { name: 'Sri Lanka', code: 'LK' },
      { name: 'Sudan', code: 'SD' },
      { name: 'Suriname', code: 'SR' },
      { name: 'Svalbard and Jan Mayen', code: 'SJ' },
      { name: 'Swaziland', code: 'SZ' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Switzerland', code: 'CH' },
      { name: 'Syrian Arab Republic', code: 'SY' },
      { name: 'Taiwan, Province of China', code: 'TW' },
      { name: 'Tajikistan', code: 'TJ' },
      { name: 'Tanzania, United Republic of', code: 'TZ' },
      { name: 'Thailand', code: 'TH' },
      { name: 'Timor-Leste', code: 'TL' },
      { name: 'Togo', code: 'TG' },
      { name: 'Tokelau', code: 'TK' },
      { name: 'Tonga', code: 'TO' },
      { name: 'Trinidad and Tobago', code: 'TT' },
      { name: 'Tunisia', code: 'TN' },
      { name: 'Turkey', code: 'TR' },
      { name: 'Turkmenistan', code: 'TM' },
      { name: 'Turks and Caicos Islands', code: 'TC' },
      { name: 'Tuvalu', code: 'TV' },
      { name: 'Uganda', code: 'UG' },
      { name: 'Ukraine', code: 'UA' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'United States', code: 'US' },
      { name: 'United States Minor Outlying Islands', code: 'UM' },
      { name: 'Uruguay', code: 'UY' },
      { name: 'Uzbekistan', code: 'UZ' },
      { name: 'Vanuatu', code: 'VU' },
      { name: 'Venezuela', code: 'VE' },
      { name: 'Viet Nam', code: 'VN' },
      { name: 'Virgin Islands, British', code: 'VG' },
      { name: 'Virgin Islands, U.S.', code: 'VI' },
      { name: 'Wallis and Futuna', code: 'WF' },
      { name: 'Western Sahara', code: 'EH' },
      { name: 'Yemen', code: 'YE' },
      { name: 'Zambia', code: 'ZM' },
      { name: 'Zimbabwe', code: 'ZW' }
    ];

    // UpdateProfile Enterprise
    function saveProfile(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.enterpriseForm');
        return false;
      }

      saveProfileItems();

      EnterprisesService.updateProfileFromForm(vm.ret)
        .then(onUpdateProfileSuccess)
        .catch(onUpdateProfileError);

    }

    function onUpdateProfileSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Profile updated!' });
    }

    function onUpdateProfileError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Profile not updated!' });
    }

    function autopopulateForms() {
      EnterprisesService.getEnterprise()
        .then(function(response) {

          let res = response.profile;

          vm.companyName = res.companyName;
          vm.URL = res.URL;
          vm.employeeCount = res.employeeCount;
          vm.yearEstablished = res.yearEstablished;
          vm.description = res.description;
          vm.companyName = res.companyName;
          vm.zipCode = res.companyAddress.zipCode;
          vm.city = res.companyAddress.city;
          vm.state = res.companyAddress.state;
          vm.classifications = res.classifications;
          vm.streetAddress = res.companyAddress.streetAddress;
          vm.country = countryByCode(res.companyAddress.country);
          vm.countryOfBusiness = countryByCode(res.countryOfBusiness);

          let user = Authentication.user;

          vm.email = user.email;
          vm.phone = user.phone;
        });
    }

    function countryByCode(code){
      for(let i = 0; i < vm.countryList.length; i++){
        if(code === vm.countryList[i].code){
          return vm.countryList[i];
        }
      }
      return '';
    }

    function saveProfileItems() {

      let profile = {
        companyAddress: {},
        classifications: []
      };

      profile.companyName = vm.companyName;
      profile.URL = vm.URL;
      profile.classifications = vm.classifications;
      profile.employeeCount = vm.employeeCount;
      profile.yearEstablished  = vm.yearEstablished;
      profile.description = vm.description;
      profile.companyName = vm.companyName;
      profile.companyAddress.zipCode = vm.zipCode;
      profile.companyAddress.city = vm.city;
      profile.companyAddress.state = vm.state;
      profile.companyAddress.streetAddress = vm.streetAddress;

      profile.companyAddress.country = vm.country.code;
      profile.countryOfBusiness = vm.countryOfBusiness.code;

      vm.ret.email = vm.email;
      vm.ret.phone = vm.phone;

      vm.ret.profile = profile;

    }


vm.classificationList = [
  {
    "code": "0111",
    "name": "Growing of cereals (except rice), leguminous crops and oil seeds"
  },
  {
    "code": "0112",
    "name": "Growing of rice"
  },
  {
    "code": "0113",
    "name": "Growing of vegetables and melons, roots and tubers"
  },
  {
    "code": "0114",
    "name": "Growing of sugar cane"
  },
  {
    "code": "0115",
    "name": "Growing of tobacco"
  },
  {
    "code": "0116",
    "name": "Growing of fibre crops"
  },
  {
    "code": "0119",
    "name": "Growing of other non-perennial crops"
  },
  {
    "code": "0121",
    "name": "Growing of grapes"
  },
  {
    "code": "0122",
    "name": "Growing of tropical and subtropical fruits"
  },
  {
    "code": "0123",
    "name": "Growing of citrus fruits"
  },
  {
    "code": "0124",
    "name": "Growing of pome fruits and stone fruits"
  },
  {
    "code": "0125",
    "name": "Growing of other tree and bush fruits and nuts"
  },
  {
    "code": "0126",
    "name": "Growing of oleaginous fruits"
  },
  {
    "code": "0127",
    "name": "Growing of beverage crops"
  },
  {
    "code": "0128",
    "name": "Growing of spices, aromatic, drug and pharmaceutical crops"
  },
  {
    "code": "0129",
    "name": "Growing of other perennial crops"
  },
  {
    "code": "0130",
    "name": "Plant propagation"
  },
  {
    "code": "0141",
    "name": "Raising of cattle and buffaloes"
  },
  {
    "code": "0142",
    "name": "Raising of horses and other equines"
  },
  {
    "code": "0143",
    "name": "Raising of camels and camelids"
  },
  {
    "code": "0144",
    "name": "Raising of sheep and goats"
  },
  {
    "code": "0145",
    "name": "Raising of swine/pigs"
  },
  {
    "code": "0146",
    "name": "Raising of poultry"
  },
  {
    "code": "0149",
    "name": "Raising of other animals"
  },
  {
    "code": "0150",
    "name": "Mixed farming"
  },
  {
    "code": "0161",
    "name": "Support activities for crop production"
  },
  {
    "code": "0162",
    "name": "Support activities for animal production"
  },
  {
    "code": "0163",
    "name": "Post-harvest crop activities"
  },
  {
    "code": "0164",
    "name": "Seed processing for propagation"
  },
  {
    "code": "0170",
    "name": "Hunting, trapping and related service activities"
  },
  {
    "code": "0210",
    "name": "Silviculture and other forestry activities"
  },
  {
    "code": "0220",
    "name": "Logging"
  },
  {
    "code": "0230",
    "name": "Gathering of non-wood forest products"
  },
  {
    "code": "0240",
    "name": "Support services to forestry"
  },
  {
    "code": "0311",
    "name": "Marine fishing"
  },
  {
    "code": "0312",
    "name": "Freshwater fishing"
  },
  {
    "code": "0321",
    "name": "Marine aquaculture"
  },
  {
    "code": "0322",
    "name": "Freshwater aquaculture"
  },
  {
    "code": "0510",
    "name": "Mining of hard coal"
  },
  {
    "code": "0520",
    "name": "Mining of lignite"
  },
  {
    "code": "0610",
    "name": "Extraction of crude petroleum"
  },
  {
    "code": "0620",
    "name": "Extraction of natural gas"
  },
  {
    "code": "0710",
    "name": "Mining of iron ores"
  },
  {
    "code": "0721",
    "name": "Mining of uranium and thorium ores"
  },
  {
    "code": "0729",
    "name": "Mining of other non-ferrous metal ores"
  },
  {
    "code": "0810",
    "name": "Quarrying of stone, sand and clay"
  },
  {
    "code": "0891",
    "name": "Mining of chemical and fertilizer minerals"
  },
  {
    "code": "0892",
    "name": "Extraction of peat"
  },
  {
    "code": "0893",
    "name": "Extraction of salt"
  },
  {
    "code": "0899",
    "name": "Other mining and quarrying n.e.c."
  },
  {
    "code": "0910",
    "name": "Support activities for petroleum and natural gas extraction"
  },
  {
    "code": "0990",
    "name": "Support activities for other mining and quarrying"
  },
  {
    "code": "1010",
    "name": "Processing and preserving of meat"
  },
  {
    "code": "1020",
    "name": "Processing and preserving of fish, crustaceans and molluscs"
  },
  {
    "code": "1030",
    "name": "Processing and preserving of fruit and vegetables"
  },
  {
    "code": "1040",
    "name": "Manufacture of vegetable and animal oils and fats"
  },
  {
    "code": "1050",
    "name": "Manufacture of dairy products"
  },
  {
    "code": "1061",
    "name": "Manufacture of grain mill products"
  },
  {
    "code": "1062",
    "name": "Manufacture of starches and starch products"
  },
  {
    "code": "1071",
    "name": "Manufacture of bakery products"
  },
  {
    "code": "1072",
    "name": "Manufacture of sugar"
  },
  {
    "code": "1073",
    "name": "Manufacture of cocoa, chocolate and sugar confectionery"
  },
  {
    "code": "1074",
    "name": "Manufacture of macaroni, noodles, couscous and similar farinaceous products"
  },
  {
    "code": "1075",
    "name": "Manufacture of prepared meals and dishes"
  },
  {
    "code": "1079",
    "name": "Manufacture of other food products n.e.c."
  },
  {
    "code": "1080",
    "name": "Manufacture of prepared animal feeds"
  },
  {
    "code": "1101",
    "name": "Distilling, rectifying and blending of spirits"
  },
  {
    "code": "1102",
    "name": "Manufacture of wines"
  },
  {
    "code": "1103",
    "name": "Manufacture of malt liquors and malt"
  },
  {
    "code": "1104",
    "name": "Manufacture of soft drinks; production of mineral waters and other bottled waters"
  },
  {
    "code": "1200",
    "name": "Manufacture of tobacco products"
  },
  {
    "code": "1311",
    "name": "Preparation and spinning of textile fibres"
  },
  {
    "code": "1312",
    "name": "Weaving of textiles"
  },
  {
    "code": "1313",
    "name": "Finishing of textiles"
  },
  {
    "code": "1391",
    "name": "Manufacture of knitted and crocheted fabrics"
  },
  {
    "code": "1392",
    "name": "Manufacture of made-up textile articles, except apparel"
  },
  {
    "code": "1393",
    "name": "Manufacture of carpets and rugs"
  },
  {
    "code": "1394",
    "name": "Manufacture of cordage, rope, twine and netting"
  },
  {
    "code": "1399",
    "name": "Manufacture of other textiles n.e.c."
  },
  {
    "code": "1410",
    "name": "Manufacture of wearing apparel, except fur apparel"
  },
  {
    "code": "1420",
    "name": "Manufacture of articles of fur"
  },
  {
    "code": "1430",
    "name": "Manufacture of knitted and crocheted apparel"
  },
  {
    "code": "1511",
    "name": "Tanning and dressing of leather; dressing and dyeing of fur"
  },
  {
    "code": "1512",
    "name": "Manufacture of luggage, handbags and the like, saddlery and harness"
  },
  {
    "code": "1520",
    "name": "Manufacture of footwear"
  },
  {
    "code": "1610",
    "name": "Sawmilling and planing of wood"
  },
  {
    "code": "1621",
    "name": "Manufacture of veneer sheets and wood-based panels"
  },
  {
    "code": "1622",
    "name": "Manufacture of builders' carpentry and joinery"
  },
  {
    "code": "1623",
    "name": "Manufacture of wooden containers"
  },
  {
    "code": "1629",
    "name": "Manufacture of other products of wood; manufacture of articles of cork, straw and plaiting materials"
  },
  {
    "code": "1701",
    "name": "Manufacture of pulp, paper and paperboard"
  },
  {
    "code": "1702",
    "name": "Manufacture of corrugated paper and paperboard and of containers of paper and paperboard"
  },
  {
    "code": "1709",
    "name": "Manufacture of other articles of paper and paperboard"
  },
  {
    "code": "1811",
    "name": "Printing"
  },
  {
    "code": "1812",
    "name": "Service activities related to printing"
  },
  {
    "code": "1820",
    "name": "Reproduction of recorded media"
  },
  {
    "code": "1910",
    "name": "Manufacture of coke oven products"
  },
  {
    "code": "1920",
    "name": "Manufacture of refined petroleum products"
  },
  {
    "code": "2011",
    "name": "Manufacture of basic chemicals"
  },
  {
    "code": "2012",
    "name": "Manufacture of fertilizers and nitrogen compounds"
  },
  {
    "code": "2013",
    "name": "Manufacture of plastics and synthetic rubber in primary forms"
  },
  {
    "code": "2021",
    "name": "Manufacture of pesticides and other agrochemical products"
  },
  {
    "code": "2022",
    "name": "Manufacture of paints, varnishes and similar coatings, printing ink and mastics"
  },
  {
    "code": "2023",
    "name": "Manufacture of soap and detergents, cleaning and polishing preparations, perfumes and toilet preparations"
  },
  {
    "code": "2029",
    "name": "Manufacture of other chemical products n.e.c."
  },
  {
    "code": "2030",
    "name": "Manufacture of man-made fibres"
  },
  {
    "code": "2100",
    "name": "Manufacture of pharmaceuticals, medicinal chemical and botanical products"
  },
  {
    "code": "2211",
    "name": "Manufacture of rubber tyres and tubes; retreading and rebuilding of rubber tyres"
  },
  {
    "code": "2219",
    "name": "Manufacture of other rubber products"
  },
  {
    "code": "2220",
    "name": "Manufacture of plastics products"
  },
  {
    "code": "2310",
    "name": "Manufacture of glass and glass products"
  },
  {
    "code": "2391",
    "name": "Manufacture of refractory products"
  },
  {
    "code": "2392",
    "name": "Manufacture of clay building materials"
  },
  {
    "code": "2393",
    "name": "Manufacture of other porcelain and ceramic products"
  },
  {
    "code": "2394",
    "name": "Manufacture of cement, lime and plaster"
  },
  {
    "code": "2395",
    "name": "Manufacture of articles of concrete, cement and plaster"
  },
  {
    "code": "2396",
    "name": "Cutting, shaping and finishing of stone"
  },
  {
    "code": "2399",
    "name": "Manufacture of other non-metallic mineral products n.e.c."
  },
  {
    "code": "2410",
    "name": "Manufacture of basic iron and steel"
  },
  {
    "code": "2420",
    "name": "Manufacture of basic precious and other non-ferrous metals"
  },
  {
    "code": "2431",
    "name": "Casting of iron and steel"
  },
  {
    "code": "2432",
    "name": "Casting of non-ferrous metals"
  },
  {
    "code": "2511",
    "name": "Manufacture of structural metal products"
  },
  {
    "code": "2512",
    "name": "Manufacture of tanks, reservoirs and containers of metal"
  },
  {
    "code": "2513",
    "name": "Manufacture of steam generators, except central heating hot water boilers"
  },
  {
    "code": "2520",
    "name": "Manufacture of weapons and ammunition"
  },
  {
    "code": "2591",
    "name": "Forging, pressing, stamping and roll-forming of metal; powder metallurgy"
  },
  {
    "code": "2592",
    "name": "Treatment and coating of metals; machining"
  },
  {
    "code": "2593",
    "name": "Manufacture of cutlery, hand tools and general hardware"
  },
  {
    "code": "2599",
    "name": "Manufacture of other fabricated metal products n.e.c."
  },
  {
    "code": "2610",
    "name": "Manufacture of electronic components and boards"
  },
  {
    "code": "2620",
    "name": "Manufacture of computers and peripheral equipment"
  },
  {
    "code": "2630",
    "name": "Manufacture of communication equipment"
  },
  {
    "code": "2640",
    "name": "Manufacture of consumer electronics"
  },
  {
    "code": "2651",
    "name": "Manufacture of measuring, testing, navigating and control equipment"
  },
  {
    "code": "2652",
    "name": "Manufacture of watches and clocks"
  },
  {
    "code": "2660",
    "name": "Manufacture of irradiation, electromedical and electrotherapeutic equipment"
  },
  {
    "code": "2670",
    "name": "Manufacture of optical instruments and photographic equipment"
  },
  {
    "code": "2680",
    "name": "Manufacture of magnetic and optical media"
  },
  {
    "code": "2710",
    "name": "Manufacture of electric motors, generators, transformers and electricity distribution and control apparatus"
  },
  {
    "code": "2720",
    "name": "Manufacture of batteries and accumulators"
  },
  {
    "code": "2731",
    "name": "Manufacture of fibre optic cables"
  },
  {
    "code": "2732",
    "name": "Manufacture of other electronic and electric wires and cables"
  },
  {
    "code": "2733",
    "name": "Manufacture of wiring devices"
  },
  {
    "code": "2740",
    "name": "Manufacture of electric lighting equipment"
  },
  {
    "code": "2750",
    "name": "Manufacture of domestic appliances"
  },
  {
    "code": "2790",
    "name": "Manufacture of other electrical equipment"
  },
  {
    "code": "2811",
    "name": "Manufacture of engines and turbines, except aircraft, vehicle and cycle engines"
  },
  {
    "code": "2812",
    "name": "Manufacture of fluid power equipment"
  },
  {
    "code": "2813",
    "name": "Manufacture of other pumps, compressors, taps and valves"
  },
  {
    "code": "2814",
    "name": "Manufacture of bearings, gears, gearing and driving elements"
  },
  {
    "code": "2815",
    "name": "Manufacture of ovens, furnaces and furnace burners"
  },
  {
    "code": "2816",
    "name": "Manufacture of lifting and handling equipment"
  },
  {
    "code": "2817",
    "name": "Manufacture of office machinery and equipment (except computers and peripheral equipment)"
  },
  {
    "code": "2818",
    "name": "Manufacture of power-driven hand tools"
  },
  {
    "code": "2819",
    "name": "Manufacture of other general-purpose machinery"
  },
  {
    "code": "2821",
    "name": "Manufacture of agricultural and forestry machinery"
  },
  {
    "code": "2822",
    "name": "Manufacture of metal-forming machinery and machine tools"
  },
  {
    "code": "2823",
    "name": "Manufacture of machinery for metallurgy"
  },
  {
    "code": "2824",
    "name": "Manufacture of machinery for mining, quarrying and construction"
  },
  {
    "code": "2825",
    "name": "Manufacture of machinery for food, beverage and tobacco processing"
  },
  {
    "code": "2826",
    "name": "Manufacture of machinery for textile, apparel and leather production"
  },
  {
    "code": "2829",
    "name": "Manufacture of other special-purpose machinery"
  },
  {
    "code": "2910",
    "name": "Manufacture of motor vehicles"
  },
  {
    "code": "2920",
    "name": "Manufacture of bodies (coachwork) for motor vehicles; manufacture of trailers and semi-trailers"
  },
  {
    "code": "2930",
    "name": "Manufacture of parts and accessories for motor vehicles"
  },
  {
    "code": "3011",
    "name": "Building of ships and floating structures"
  },
  {
    "code": "3012",
    "name": "Building of pleasure and sporting boats"
  },
  {
    "code": "3020",
    "name": "Manufacture of railway locomotives and rolling stock"
  },
  {
    "code": "3030",
    "name": "Manufacture of air and spacecraft and related machinery"
  },
  {
    "code": "3040",
    "name": "Manufacture of military fighting vehicles"
  },
  {
    "code": "3091",
    "name": "Manufacture of motorcycles"
  },
  {
    "code": "3092",
    "name": "Manufacture of bicycles and invalid carriages"
  },
  {
    "code": "3099",
    "name": "Manufacture of other transport equipment n.e.c."
  },
  {
    "code": "3100",
    "name": "Manufacture of furniture"
  },
  {
    "code": "3211",
    "name": "Manufacture of jewellery and related articles"
  },
  {
    "code": "3212",
    "name": "Manufacture of imitation jewellery and related articles"
  },
  {
    "code": "3220",
    "name": "Manufacture of musical instruments"
  },
  {
    "code": "3230",
    "name": "Manufacture of sports goods"
  },
  {
    "code": "3240",
    "name": "Manufacture of games and toys"
  },
  {
    "code": "3250",
    "name": "Manufacture of medical and dental instruments and supplies"
  },
  {
    "code": "3290",
    "name": "Other manufacturing n.e.c."
  },
  {
    "code": "3311",
    "name": "Repair of fabricated metal products"
  },
  {
    "code": "3312",
    "name": "Repair of machinery"
  },
  {
    "code": "3313",
    "name": "Repair of electronic and optical equipment"
  },
  {
    "code": "3314",
    "name": "Repair of electrical equipment"
  },
  {
    "code": "3315",
    "name": "Repair of transport equipment, except motor vehicles"
  },
  {
    "code": "3319",
    "name": "Repair of other equipment"
  },
  {
    "code": "3320",
    "name": "Installation of industrial machinery and equipment"
  },
  {
    "code": "3510",
    "name": "Electric power generation, transmission and distribution"
  },
  {
    "code": "3520",
    "name": "Manufacture of gas; distribution of gaseous fuels through mains"
  },
  {
    "code": "3530",
    "name": "Steam and air conditioning supply"
  },
  {
    "code": "3600",
    "name": "Water collection, treatment and supply"
  },
  {
    "code": "3700",
    "name": "Sewerage"
  },
  {
    "code": "3811",
    "name": "Collection of non-hazardous waste"
  },
  {
    "code": "3812",
    "name": "Collection of hazardous waste"
  },
  {
    "code": "3821",
    "name": "Treatment and disposal of non-hazardous waste"
  },
  {
    "code": "3822",
    "name": "Treatment and disposal of hazardous waste"
  },
  {
    "code": "3830",
    "name": "Materials recovery"
  },
  {
    "code": "3900",
    "name": "Remediation activities and other waste management services"
  },
  {
    "code": "4100",
    "name": "Construction of buildings"
  },
  {
    "code": "4210",
    "name": "Construction of roads and railways"
  },
  {
    "code": "4220",
    "name": "Construction of utility projects"
  },
  {
    "code": "4290",
    "name": "Construction of other civil engineering projects"
  },
  {
    "code": "4311",
    "name": "Demolition"
  },
  {
    "code": "4312",
    "name": "Site preparation"
  },
  {
    "code": "4321",
    "name": "Electrical installation"
  },
  {
    "code": "4322",
    "name": "Plumbing, heat and air-conditioning installation"
  },
  {
    "code": "4329",
    "name": "Other construction installation"
  },
  {
    "code": "4330",
    "name": "Building completion and finishing"
  },
  {
    "code": "4390",
    "name": "Other specialized construction activities"
  },
  {
    "code": "4510",
    "name": "Sale of motor vehicles"
  },
  {
    "code": "4520",
    "name": "Maintenance and repair of motor vehicles"
  },
  {
    "code": "4530",
    "name": "Sale of motor vehicle parts and accessories"
  },
  {
    "code": "4540",
    "name": "Sale, maintenance and repair of motorcycles and related parts and accessories"
  },
  {
    "code": "4610",
    "name": "Wholesale on a fee or contract basis"
  },
  {
    "code": "4620",
    "name": "Wholesale of agricultural raw materials and live animals"
  },
  {
    "code": "4630",
    "name": "Wholesale of food, beverages and tobacco"
  },
  {
    "code": "4641",
    "name": "Wholesale of textiles, clothing and footwear"
  },
  {
    "code": "4649",
    "name": "Wholesale of other household goods"
  },
  {
    "code": "4651",
    "name": "Wholesale of computers, computer peripheral equipment and software"
  },
  {
    "code": "4652",
    "name": "Wholesale of electronic and telecommunications equipment and parts"
  },
  {
    "code": "4653",
    "name": "Wholesale of agricultural machinery, equipment and supplies"
  },
  {
    "code": "4659",
    "name": "Wholesale of other machinery and equipment"
  },
  {
    "code": "4661",
    "name": "Wholesale of solid, liquid and gaseous fuels and related products"
  },
  {
    "code": "4662",
    "name": "Wholesale of metals and metal ores"
  },
  {
    "code": "4663",
    "name": "Wholesale of construction materials, hardware, plumbing and heating equipment and supplies"
  },
  {
    "code": "4669",
    "name": "Wholesale of waste and scrap and other products n.e.c."
  },
  {
    "code": "4690",
    "name": "Non-specialized wholesale trade"
  },
  {
    "code": "4711",
    "name": "Retail sale in non-specialized stores with food, beverages or tobacco predominating"
  },
  {
    "code": "4719",
    "name": "Other retail sale in non-specialized stores"
  },
  {
    "code": "4721",
    "name": "Retail sale of food in specialized stores"
  },
  {
    "code": "4722",
    "name": "Retail sale of beverages in specialized stores"
  },
  {
    "code": "4723",
    "name": "Retail sale of tobacco products in specialized stores"
  },
  {
    "code": "4730",
    "name": "Retail sale of automotive fuel in specialized stores"
  },
  {
    "code": "4741",
    "name": "Retail sale of computers, peripheral units, software and telecommunications equipment in specialized stores"
  },
  {
    "code": "4742",
    "name": "Retail sale of audio and video equipment in specialized stores"
  },
  {
    "code": "4751",
    "name": "Retail sale of textiles in specialized stores"
  },
  {
    "code": "4752",
    "name": "Retail sale of hardware, paints and glass in specialized stores"
  },
  {
    "code": "4753",
    "name": "Retail sale of carpets, rugs, wall and floor coverings in specialized stores"
  },
  {
    "code": "4759",
    "name": "Retail sale of electrical household appliances, furniture, lighting equipment and other household articles in specialized stores"
  },
  {
    "code": "4761",
    "name": "Retail sale of books, newspapers and stationary in specialized stores"
  },
  {
    "code": "4762",
    "name": "Retail sale of music and video recordings in specialized stores"
  },
  {
    "code": "4763",
    "name": "Retail sale of sporting equipment in specialized stores"
  },
  {
    "code": "4764",
    "name": "Retail sale of games and toys in specialized stores"
  },
  {
    "code": "4771",
    "name": "Retail sale of clothing, footwear and leather articles in specialized stores"
  },
  {
    "code": "4772",
    "name": "Retail sale of pharmaceutical and medical goods, cosmetic and toilet articles in specialized stores"
  },
  {
    "code": "4773",
    "name": "Other retail sale of new goods in specialized stores"
  },
  {
    "code": "4774",
    "name": "Retail sale of second-hand goods"
  },
  {
    "code": "4781",
    "name": "Retail sale via stalls and markets of food, beverages and tobacco products"
  },
  {
    "code": "4782",
    "name": "Retail sale via stalls and markets of textiles, clothing and footwear"
  },
  {
    "code": "4789",
    "name": "Retail sale via stalls and markets of other goods"
  },
  {
    "code": "4791",
    "name": "Retail sale via mail order houses or via Internet"
  },
  {
    "code": "4799",
    "name": "Other retail sale not in stores, stalls or markets"
  },
  {
    "code": "4911",
    "name": "Passenger rail transport, interurban"
  },
  {
    "code": "4912",
    "name": "Freight rail transport"
  },
  {
    "code": "4921",
    "name": "Urban and suburban passenger land transport"
  },
  {
    "code": "4922",
    "name": "Other passenger land transport"
  },
  {
    "code": "4923",
    "name": "Freight transport by road"
  },
  {
    "code": "4930",
    "name": "Transport via pipeline"
  },
  {
    "code": "5011",
    "name": "Sea and coastal passenger water transport"
  },
  {
    "code": "5012",
    "name": "Sea and coastal freight water transport"
  },
  {
    "code": "5021",
    "name": "Inland passenger water transport"
  },
  {
    "code": "5022",
    "name": "Inland freight water transport"
  },
  {
    "code": "5110",
    "name": "Passenger air transport"
  },
  {
    "code": "5120",
    "name": "Freight air transport"
  },
  {
    "code": "5210",
    "name": "Warehousing and storage"
  },
  {
    "code": "5221",
    "name": "Service activities incidental to land transportation"
  },
  {
    "code": "5222",
    "name": "Service activities incidental to water transportation"
  },
  {
    "code": "5223",
    "name": "Service activities incidental to air transportation"
  },
  {
    "code": "5224",
    "name": "Cargo handling"
  },
  {
    "code": "5229",
    "name": "Other transportation support activities"
  },
  {
    "code": "5310",
    "name": "Postal activities"
  },
  {
    "code": "5320",
    "name": "Courier activities"
  },
  {
    "code": "5510",
    "name": "Short term accommodation activities"
  },
  {
    "code": "5520",
    "name": "Camping grounds, recreational vehicle parks and trailer parks"
  },
  {
    "code": "5590",
    "name": "Other accommodation"
  },
  {
    "code": "5610",
    "name": "Restaurants and mobile food service activities"
  },
  {
    "code": "5621",
    "name": "Event catering"
  },
  {
    "code": "5629",
    "name": "Other food service activities"
  },
  {
    "code": "5630",
    "name": "Beverage serving activities"
  },
  {
    "code": "5811",
    "name": "Book publishing"
  },
  {
    "code": "5812",
    "name": "Publishing of directories and mailing lists"
  },
  {
    "code": "5813",
    "name": "Publishing of newspapers, journals and periodicals"
  },
  {
    "code": "5819",
    "name": "Other publishing activities"
  },
  {
    "code": "5820",
    "name": "Software publishing"
  },
  {
    "code": "5911",
    "name": "Motion picture, video and television programme production activities"
  },
  {
    "code": "5912",
    "name": "Motion picture, video and television programme post-production activities"
  },
  {
    "code": "5913",
    "name": "Motion picture, video and television programme distribution activities"
  },
  {
    "code": "5914",
    "name": "Motion picture projection activities"
  },
  {
    "code": "5920",
    "name": "Sound recording and music publishing activities"
  },
  {
    "code": "6010",
    "name": "Radio broadcasting"
  },
  {
    "code": "6020",
    "name": "Television programming and broadcasting activities"
  },
  {
    "code": "6110",
    "name": "Wired telecommunications activities"
  },
  {
    "code": "6120",
    "name": "Wireless telecommunications activities"
  },
  {
    "code": "6130",
    "name": "Satellite telecommunications activities"
  },
  {
    "code": "6190",
    "name": "Other telecommunications activities"
  },
  {
    "code": "6201",
    "name": "Computer programming activities"
  },
  {
    "code": "6202",
    "name": "Computer consultancy and computer facilities management activities"
  },
  {
    "code": "6209",
    "name": "Other information technology and computer service activities"
  },
  {
    "code": "6311",
    "name": "Data processing, hosting and related activities"
  },
  {
    "code": "6312",
    "name": "Web portals"
  },
  {
    "code": "6391",
    "name": "News agency activities"
  },
  {
    "code": "6399",
    "name": "Other information service activities n.e.c."
  },
  {
    "code": "6411",
    "name": "Central banking"
  },
  {
    "code": "6419",
    "name": "Other monetary intermediation"
  },
  {
    "code": "6420",
    "name": "Activities of holding companies"
  },
  {
    "code": "6430",
    "name": "Trusts, funds and similar financial entities"
  },
  {
    "code": "6491",
    "name": "Financial leasing"
  },
  {
    "code": "6492",
    "name": "Other credit granting"
  },
  {
    "code": "6499",
    "name": "Other financial service activities, except insurance and pension funding activities, n.e.c."
  },
  {
    "code": "6511",
    "name": "Life insurance"
  },
  {
    "code": "6512",
    "name": "Non-life insurance"
  },
  {
    "code": "6520",
    "name": "Reinsurance"
  },
  {
    "code": "6530",
    "name": "Pension funding"
  },
  {
    "code": "6611",
    "name": "Administration of financial markets"
  },
  {
    "code": "6612",
    "name": "Security and commodity contracts brokerage"
  },
  {
    "code": "6619",
    "name": "Other activities auxiliary to financial service activities"
  },
  {
    "code": "6621",
    "name": "Risk and damage evaluation"
  },
  {
    "code": "6622",
    "name": "Activities of insurance agents and brokers"
  },
  {
    "code": "6629",
    "name": "Other activities auxiliary to insurance and pension funding"
  },
  {
    "code": "6630",
    "name": "Fund management activities"
  },
  {
    "code": "6810",
    "name": "Real estate activities with own or leased property"
  },
  {
    "code": "6820",
    "name": "Real estate activities on a fee or contract basis"
  },
  {
    "code": "6910",
    "name": "Legal activities"
  },
  {
    "code": "6920",
    "name": "Accounting, bookkeeping and auditing activities; tax consultancy"
  },
  {
    "code": "7010",
    "name": "Activities of head offices"
  },
  {
    "code": "7020",
    "name": "Management consultancy activities"
  },
  {
    "code": "7110",
    "name": "Architectural and engineering activities and related technical consultancy"
  },
  {
    "code": "7120",
    "name": "Technical testing and analysis"
  },
  {
    "code": "7210",
    "name": "Research and experimental development on natural sciences and engineering"
  },
  {
    "code": "7220",
    "name": "Research and experimental development on social sciences and humanities"
  },
  {
    "code": "7310",
    "name": "Advertising"
  },
  {
    "code": "7320",
    "name": "Market research and public opinion polling"
  },
  {
    "code": "7410",
    "name": "Specialized design activities"
  },
  {
    "code": "7420",
    "name": "Photographic activities"
  },
  {
    "code": "7490",
    "name": "Other professional, scientific and technical activities n.e.c."
  },
  {
    "code": "7500",
    "name": "Veterinary activities"
  },
  {
    "code": "7710",
    "name": "Renting and leasing of motor vehicles"
  },
  {
    "code": "7721",
    "name": "Renting and leasing of recreational and sports goods"
  },
  {
    "code": "7722",
    "name": "Renting of video tapes and disks"
  },
  {
    "code": "7729",
    "name": "Renting and leasing of other personal and household goods"
  },
  {
    "code": "7730",
    "name": "Renting and leasing of other machinery, equipment and tangible goods"
  },
  {
    "code": "7740",
    "name": "Leasing of intellectual property and similar products, except copyrighted works"
  },
  {
    "code": "7810",
    "name": "Activities of employment placement agencies"
  },
  {
    "code": "7820",
    "name": "Temporary employment agency activities"
  },
  {
    "code": "7830",
    "name": "Other human resources provision"
  },
  {
    "code": "7911",
    "name": "Travel agency activities"
  },
  {
    "code": "7912",
    "name": "Tour operator activities"
  },
  {
    "code": "7990",
    "name": "Other reservation service and related activities"
  },
  {
    "code": "8010",
    "name": "Private security activities"
  },
  {
    "code": "8020",
    "name": "Security systems service activities"
  },
  {
    "code": "8030",
    "name": "Investigation activities"
  },
  {
    "code": "8110",
    "name": "Combined facilities support activities"
  },
  {
    "code": "8121",
    "name": "General cleaning of buildings"
  },
  {
    "code": "8129",
    "name": "Other building and industrial cleaning activities"
  },
  {
    "code": "8130",
    "name": "Landscape care and maintenance service activities"
  },
  {
    "code": "8211",
    "name": "Combined office administrative service activities"
  },
  {
    "code": "8219",
    "name": "Photocopying, document preparation and other specialized office support activities"
  },
  {
    "code": "8220",
    "name": "Activities of call centres"
  },
  {
    "code": "8230",
    "name": "Organization of conventions and trade shows"
  },
  {
    "code": "8291",
    "name": "Activities of collection agencies and credit bureaus"
  },
  {
    "code": "8292",
    "name": "Packaging activities"
  },
  {
    "code": "8299",
    "name": "Other business support service activities n.e.c."
  },
  {
    "code": "8411",
    "name": "General public administration activities"
  },
  {
    "code": "8412",
    "name": "Regulation of the activities of providing health care, education, cultural services and other social services, excluding social security"
  },
  {
    "code": "8413",
    "name": "Regulation of and contribution to more efficient operation of businesses"
  },
  {
    "code": "8421",
    "name": "Foreign affairs"
  },
  {
    "code": "8422",
    "name": "Defence activities"
  },
  {
    "code": "8423",
    "name": "Public order and safety activities"
  },
  {
    "code": "8430",
    "name": "Compulsory social security activities"
  },
  {
    "code": "8510",
    "name": "Pre-primary and primary education"
  },
  {
    "code": "8521",
    "name": "General secondary education"
  },
  {
    "code": "8522",
    "name": "Technical and vocational secondary education"
  },
  {
    "code": "8530",
    "name": "Higher education"
  },
  {
    "code": "8541",
    "name": "Sports and recreation education"
  },
  {
    "code": "8542",
    "name": "Cultural education"
  },
  {
    "code": "8549",
    "name": "Other education n.e.c."
  },
  {
    "code": "8550",
    "name": "Educational support activities"
  },
  {
    "code": "8610",
    "name": "Hospital activities"
  },
  {
    "code": "8620",
    "name": "Medical and dental practice activities"
  },
  {
    "code": "8690",
    "name": "Other human health activities"
  },
  {
    "code": "8710",
    "name": "Residential nursing care facilities"
  },
  {
    "code": "8720",
    "name": "Residential care activities for mental retardation, mental health and substance abuse"
  },
  {
    "code": "8730",
    "name": "Residential care activities for the elderly and disabled"
  },
  {
    "code": "8790",
    "name": "Other residential care activities"
  },
  {
    "code": "8810",
    "name": "Social work activities without accommodation for the elderly and disabled"
  },
  {
    "code": "8890",
    "name": "Other social work activities without accommodation"
  },
  {
    "code": "9000",
    "name": "Creative, arts and entertainment activities"
  },
  {
    "code": "9101",
    "name": "Library and archives activities"
  },
  {
    "code": "9102",
    "name": "Museums activities and operation of historical sites and buildings"
  },
  {
    "code": "9103",
    "name": "Botanical and zoological gardens and nature reserves activities"
  },
  {
    "code": "9200",
    "name": "Gambling and betting activities"
  },
  {
    "code": "9311",
    "name": "Operation of sports facilities"
  },
  {
    "code": "9312",
    "name": "Activities of sports clubs"
  },
  {
    "code": "9319",
    "name": "Other sports activities"
  },
  {
    "code": "9321",
    "name": "Activities of amusement parks and theme parks"
  },
  {
    "code": "9329",
    "name": "Other amusement and recreation activities n.e.c."
  },
  {
    "code": "9411",
    "name": "Activities of business and employers membership organizations"
  },
  {
    "code": "9412",
    "name": "Activities of professional membership organizations"
  },
  {
    "code": "9420",
    "name": "Activities of trade unions"
  },
  {
    "code": "9491",
    "name": "Activities of religious organizations"
  },
  {
    "code": "9492",
    "name": "Activities of political organizations"
  },
  {
    "code": "9499",
    "name": "Activities of other membership organizations n.e.c."
  },
  {
    "code": "9511",
    "name": "Repair of computers and peripheral equipment"
  },
  {
    "code": "9512",
    "name": "Repair of communication equipment"
  },
  {
    "code": "9521",
    "name": "Repair of consumer electronics"
  },
  {
    "code": "9522",
    "name": "Repair of household appliances and home and garden equipment"
  },
  {
    "code": "9523",
    "name": "Repair of footwear and leather goods"
  },
  {
    "code": "9524",
    "name": "Repair of furniture and home furnishings"
  },
  {
    "code": "9529",
    "name": "Repair of other personal and household goods"
  },
  {
    "code": "9601",
    "name": "Washing and (dry-) cleaning of textile and fur products"
  },
  {
    "code": "9602",
    "name": "Hairdressing and other beauty treatment"
  },
  {
    "code": "9603",
    "name": "Funeral and related activities"
  },
  {
    "code": "9609",
    "name": "Other personal service activities n.e.c."
  },
  {
    "code": "9700",
    "name": "Activities of households as employers of domestic personnel"
  },
  {
    "code": "9810",
    "name": "Undifferentiated goods-producing activities of private households for own use"
  },
  {
    "code": "9820",
    "name": "Undifferentiated service-producing activities of private households for own use"
  },
  {
    "code": "9900",
    "name": "Activities of extraterritorial organizations and bodies"
  }
];







  }
}());
