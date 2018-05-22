/* Модальное окно Гео-привязки */
	$(document).ready(function() {
      var winboxShow = false;
      var winboxObject;
      var winboxType;
      var winboxIsQuickview = false;
      var cart_type;
      if(cart_type == 'extended'){
          var winboxTriggers = '.winbox, .cart-add';
      }else{
          var winboxTriggers = '.winbox';
      }
      $('body').on('click', '.winbox', function(e){
          e.preventDefault();
          winboxObject = $(this);
          winboxObjectProductTitle = winboxObject.data('product-title');
          winboxObjectVariantId = winboxObject.data('variant-id');
          winboxObjectVariantPrice = winboxObject.data('variant-price');
          winboxObjectVariantImage = winboxObject.data('variant-image');
          winboxObjectProductId = winboxObject.data('product-id');
          if(winboxObject.hasClass('cart-add')){
              winboxType = 'cart';
          }else{
              winboxType = winboxObject.data('window').split('|')[0];
          }
          if(winboxShow){
              if(quickviewCurrent != '' && (winboxObject.data('window') == 'request' || winboxObject.data('window') == 'quickorder')){
                  winboxIsQuickview = true;
              }
              if($('.window').hasClass('window-type-menu')){
                  $('.window').addClass('window-tohide-menu');
              }
              $('.window').addClass('window-tohide').animate({left: 0}, 200, function(){

                  $('.window').attr('class', 'window window-tohide window-type-'+winboxType);
                  $('.window-content').remove();
                  winboxData(winboxObject);
                  if(winboxType != 'quickview' && winboxType != 'cart'){
                      $('.window').animate({left: 0}, 200, function(){
                          $('.window').removeClass('window-tohide');
                      });
                  }
                  winboxShow = true;
              });
          }else{
              $('body').append('<div class="window window-tohide window-type-'+winboxType+'"><div class="window-height"></div><div class="window-data"><span class="window-close js-window-close"><i class="fancybox-item fancybox-close"></i></span></div><div class="window-fake-shade window-close js-window-close"></div></div><div class="window-shade"></div>');
              $('body').css('padding-right',window.innerWidth-document.body.clientWidth).css('overflow','hidden');
              winboxData(winboxObject);
              $('.window-shade').fadeIn(200);
              if(winboxType != 'quickview' && winboxType != 'cart'){
                  $('.window').animate({left: 0}, 200, function(){
                      $('.window').removeClass('window-tohide');
                  });
              }
              winboxShow = true;
          }
      });
      $('body').on('click', '.js-window-close', function(e){
          e.preventDefault();
          if(winboxIsQuickview){
              quickviewCurrent.trigger('click');
              winboxIsQuickview = false;
              quickviewCurrent = '';
          }else{
              $('.window').addClass('window-tohide');
              $('.window-shade').fadeOut(200,function(){
                  $('body').css('padding-right',0).css('overflow','auto');
                  $('.window-shade').remove();
                  $('.window').remove();
                  winboxShow = false;
              });
          }
          geoIsUpdate = true;
      });
      var windowContent;
      var wbWindow;
      var wbLogin;
      var wbQuickorder;
      var wbTextTitle = '';
      var wbTextContent = '';
      var quickviewProductsId = new Array();
      var quickviewCurrent = '';
      function winboxData(obj){
          $geoType = '';
          if(obj.hasClass('cart-add')){
              wbWindow = 'cart';
          }else{
              wbWindow = obj.data('window').split('|')[0];
          }
          $('.window-data').append('<div class="window-content window-obj-'+wbWindow+'"></div>');
          switch(wbWindow){
              case 'geo':
                  //GEO
                  $geoType = obj.data('window').split('|')[1];
                  windowContent = '';
                  switch($geoType){
                      case 'geoCity':
                          windowContent += '<p class="window-description">Измените город если он неверный или не определился.</p>';
                          windowContent += '<div class="js-geo-data geo-data" data-modules="countries|search|populars"></div>';
                          break;
                  }
                  break;
          }
          if(wbWindow != 'quickview'){
              $('.window-content').append(windowContent);
          }
          if(wbWindow == 'geo'){
              geoIsUpdate = false;
              checkGeo();
          }
          if(wbWindow == 'geoMap'){
              geoIsUpdate = false;
              checkGeoMap();
          }
      }
  });
   
   
   
   