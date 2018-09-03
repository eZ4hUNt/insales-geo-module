var geoDeliveryPageUrl = '';
var geoIsUpdate = true;
var geoItemsPrice = 0;
var geoTotalWeight = 0;
var geoPvzItems;
var geoPvzCoord = new Array();
var geoPvzCity;
var geoKLADR = {};

SiteDelivery = {
	deliveries: {},
	order: {},
	payments: {},
	ydelivery: {
		
		courrier: {
			title: 'Яндекс.Доставка'
		},
		pickup: {
			title: 'Яндекс.Доставка (ПВЗ)',
			url: 'https://yadostavkains.pimentos.net/delivery/get_pickup_data?insales_id=459009'
		}
	}
}

SiteDelivery.external_dispatch = function (params) {
	

	if (typeof params !== 'undefined') {
		SiteDelivery[params.operator][params.type][params.function](params.data)
	}

	
}



SiteDelivery.ydelivery.generate_request = function(data){

	var SD = SiteDelivery;
	var Order = SD.order

	if (typeof ProductJSON !== 'undefined') {
		
		product_data = {
			order_lines: [
			{
				quantity: 1,
				weight: ProductJSON.variants[0].weight,
				dimensions: null
			}
			],
			weight:  ProductJSON.variants[0].weight,
			price:  ProductJSON.variants[0].price,
		}
		
	}else{

		if (Order.order_lines.length > 0) {
			
			product_data = {
				order_lines: [],
				weight:  Order.total_weight,
				price:  Order.items_price,
			}

			for(var i = 0, length1 = Order.order_lines.length; i < length1; i++){
				line = Order.order_lines[i];
				element = {
					quantity: line.quantity,
					weight: line.weight,
					dimensions: null
				}

				product_data.order_lines.push(element);
			}

		}else{

			product_data = {
				order_lines: [
				{
					quantity: 1,
					weight: 1,
					dimensions: null
				}
				],
				weight:  1,
				price:  2000,
			}
		}

	};

	request = {
		order: {
			delivery_variant_id: data.id,
			account_id: Order.account_id,
			order_lines: product_data.order_lines,
			shipping_address: {
				full_locality_name: geoKLADR.result,
				location: {
					city: geoKLADR.city,
					city_type: geoKLADR.city_type,
					country: geoKLADR.country,
					state: geoKLADR.state,
					state_type: geoKLADR.state_type,
					zip: geoKLADR.zip
				},

				
			},

			items_price: product_data.price,
			total_weight: product_data.weight,
		}
	}

	return request; 

}


SiteDelivery.ydelivery.pickup.request = function(params){


	Pickup = SiteDelivery.ydelivery.pickup
	request_params = {
		id: params.id
	}
	request = SiteDelivery.ydelivery.generate_request(request_params)

	$.ajax({
		type: 'POST',
		url: Pickup.url,
		data: JSON.stringify(request),
		dataType: 'json',
		contentType:  'application/json',
	})
	.done(function(data) {
		SiteDelivery.deliveries[params.id].subdeliveries = data;
		Pickup.decorate(params)

	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});

}


SiteDelivery.ydelivery.courrier.request = function(params){


	Courrier = SiteDelivery.ydelivery.courrier
	request_params = {
		id: params.id
	}
	request = SiteDelivery.ydelivery.generate_request(request_params)

	$.ajax({
		type: 'POST',
		url: params.external_url,
		data: JSON.stringify(request),
		dataType: 'json',
		contentType:  'application/json',
	})
	.done(function(data) {
		SiteDelivery.deliveries[params.id].subdeliveries = data;
		Courrier.decorate(params)

	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});

}


SiteDelivery.ydelivery.courrier.decorate = function(params){
	
	Courrier = SiteDelivery.ydelivery.courrier
	Deliveries = SiteDelivery.deliveries;
	id = params.id;
	ddLineMini = [];
	ddLineDefault = [];
	min_price = 999999999999;
	min_day = 99;

	if (Deliveries[id].subdeliveries.length > 0) {
		// statement
	

	for(var i = 0, length1 = Deliveries[id].subdeliveries.length; i < length1; i++){

		delivery = Deliveries[id].subdeliveries[i]
		days = '';
		payments = [];


		if (delivery.price < min_price) {
			min_price = delivery.price
		}

		if (delivery.delivery_interval.min_days < min_day) {
			min_day = delivery.delivery_interval.min_days
		}

		Object.keys(Deliveries[id].payments).forEach(function (key) {
			payment = Deliveries[id].payments[key];

			line_pay = '';


			if (payment.description) {
				line_pay = '\
				<div class="geo-table-item-p">\
				<span class="geo-table-item-p-title geo-table-item-title-toggle js-geo-toggle">' + payment.title + '</span>\
				<div class="geo-table-item-description">\
				<p>' + payment.description + '</p>\
				</div>\
				</div>';

			}else{
				line_pay = '\
				<div class="geo-table-item-p">\
				<span class="geo-table-item-p-title">' + payment.title + '</span>\
				</div>';
			}

			payments.push(line_pay);

		});


		if (delivery.delivery_interval.max_days == delivery.delivery_interval.min_days) {
			days = delivery.delivery_interval.max_days + ' ' +  declOfNum(delivery.delivery_interval.max_days, ["день","дня","дней"])
		}else{
			days = delivery.delivery_interval.min_days + '-' + delivery.delivery_interval.max_days + ' ' +  declOfNum(delivery.delivery_interval.max_days, ["день","дня","дней"])
		}

		line = '\
		<div class="geo-table-item js-geo-item-'+ id + '' + delivery.tariff_id + '" style="display:block">\
		<div class="row">\
		<div class="col-md-4 col-sm-4 col-xs-12 js-geo-title geo-table-item-title">'+ delivery.title +'</div>\
		<div class="col-md-2 col-sm-2 col-xs-6 js-geo-price geo-table-item-price">' + InSales.formatMoney(delivery.price, cv_currency_format) + '</div>\
		<div class="col-md-2 col-sm-2 col-xs-6 js-geo-terms geo-table-item-terms">' + days + '</div>\
		<div class="col-md-4 col-sm-4 col-xs-12 js-geo-payments geo-table-item-payments">' + payments.join('') + '</div>\
		</div>\
		</div>';

		line_mini = '\
		<li class="geo-mini-table-item js-geo-item-' +id+ '' + delivery.tariff_id + '">\
		<span class="js-geo-title">Стоимость доставки (' + delivery.title + ')</span>\
		<span>\
		<a href="'+geoDeliveryPageUrl+'" class="winbox" data-window="geo|geoTerm">\
		<span class="js-geo-price">'+InSales.formatMoney(delivery.price, cv_currency_format)+'</span>\
		<span class="js-geo-terms">' + ' — ' +  days +  ' </span>\
		</a>\
		</span>\
		</li>';

		ddLineMini.push(line_mini)
		ddLineDefault.push(line)
	}
	

	$('.geo-mini-table-item.js-geo-item-'+id)
		.find('.js-geo-price')
			.html('от ' + InSales.formatMoney(min_price, cv_currency_format))
		.end()	
		.find('.js-geo-terms')
			.html(' —  от ' + min_day + ' ' + declOfNum(min_day, ["дня","дней","дней"]))
		.end()
		.show();


	$('.geo-table-item.js-geo-item-'+id)
		.after(ddLineDefault.join(''))
			.css('display', 'none');

	}else{
		$('.js-geo-item-'+id)
			.css('display', 'none')
	}		

}


SiteDelivery.ydelivery.pickup.decorate = function(params){
	
	Pickup = SiteDelivery.ydelivery.pickup
	Deliveries = SiteDelivery.deliveries;
	id = params.id;
	ddLineMini = [];
	ddLineDefault = [];

	min_price = 999999999999;
	min_day = 99;

	if (Deliveries[id].subdeliveries.length > 0) {
	for(var i = 0, length1 = Deliveries[id].subdeliveries.length; i < length1; i++){
		delivery = Deliveries[id].subdeliveries[i];

		if (delivery.price < min_price) {
			min_price = delivery.price
		}

		if (delivery.delivery_interval.min_days < min_day) {
			min_day = delivery.delivery_interval.min_days
		}
	}



		payments = []

		Object.keys(Deliveries[id].payments).forEach(function (key) {
			payment = Deliveries[id].payments[key];

			line_pay = '';


			if (payment.description) {
				line_pay = '\
				<div class="geo-table-item-p">\
				<span class="geo-table-item-p-title geo-table-item-title-toggle js-geo-toggle">' + payment.title + '</span>\
				<div class="geo-table-item-description">\
				<p>' + payment.description + '</p>\
				</div>\
				</div>';

			}else{
				line_pay = '\
				<div class="geo-table-item-p">\
				<span class="geo-table-item-p-title">' + payment.title + '</span>\
				</div>';
			}

			payments.push(line_pay);

		});



	$('.geo-table-item.js-geo-item-' + id)
		.find('.js-geo-price')
			.html('от ' + InSales.formatMoney(min_price, cv_currency_format))
		.end()
		.find('.js-geo-terms')
			.html('от ' + min_day + ' ' + declOfNum(min_day, ["дня","дней","дней"]))
			.end()

		.find('.js-geo-payments')
			.html(payments.join(''))
			.end()	
			
		.show();

	$('.geo-mini-table-item.js-geo-item-' + id)		
		.find('.js-geo-price')
			.html('от ' + InSales.formatMoney(min_price, cv_currency_format))
			.end()	
		.find('.js-geo-terms')
			.html(' —  от ' + min_day + ' ' + declOfNum(min_day, ["дня","дней","дней"]))
			.end()
		.show();

	}else{
		$('.js-geo-item-'+id)
			.css('display', 'none')
	}



}




SiteDelivery.processed_variants = function (e) {


	ddLineDefault = '<div class="geo-table-title hidden-xs"><div class="row"><div class="col-md-4 col-sm-4">Варианты доставки</div><div class="col-md-2 col-sm-2">Стоимость</div><div class="col-md-2 col-sm-2">Сроки</div><div class="col-md-4 col-sm-4">Варианты оплаты</div></div></div>';
	ddLineMini = '';



	$.each(e.deliveries, function(index, item){
		$title = ((item.description != '' && item.description != null)?'<div class="geo-table-item-p"><span class="geo-table-item-p-title geo-table-item-title-toggle js-geo-toggle">'+item.title+'</span><div class="geo-table-item-description">'+item.description+'</div></div>':'<div class="geo-table-item-p"><span class="geo-table-item-p-title">'+item.title+'</span></div>');
		ddLineDefault += '<div class="geo-table-item js-geo-item-'+item.id+'"><div class="row"><div class="col-md-4 col-sm-4 col-xs-12 js-geo-title geo-table-item-title">'+$title+'</div><div class="col-md-2 col-sm-2 col-xs-6 js-geo-price geo-table-item-price">'+InSales.formatMoney(item.price, cv_currency_format)+'</div><div class="col-md-2 col-sm-2 col-xs-6 js-geo-terms geo-table-item-terms">&nbsp;</div><div class="col-md-4 col-sm-4 col-xs-12 js-geo-payments geo-table-item-payments">&nbsp;</div></div></div>';
		ddLineMini += '<li class="geo-mini-table-item js-geo-item-'+item.id+'"><span class="js-geo-title">Стоимость доставки ('+item.title+')</span> <span><a href="'+geoDeliveryPageUrl+'" class="winbox" data-window="geo|geoTerm"><span class="js-geo-price">'+InSales.formatMoney(item.price, cv_currency_format)+'</span><span class="js-geo-terms">&nbsp;</span></a></span></li>'
	});
	$('.geo-table').html(ddLineDefault).show();



	$('.geo-mini-table').html(ddLineMini).show();



	$paymentsVariants = [];
	$.each(e.deliveries, function(index, item){


		if(item.title.indexOf(SiteDelivery.ydelivery.pickup.title) > -1){

			$('.js-geo-item-'+item.id).hide();
			params = {
				operator: 'ydelivery',
				type: 'pickup',
				function: 'request',
				data: item
			}


			if (!e.is_changed) {
				params.function = 'decorate'
			}

			SiteDelivery.external_dispatch(params)
		}

		else if (item.title.indexOf(SiteDelivery.ydelivery.courrier.title) > -1 ) {
			$('.js-geo-item-'+item.id).hide();
			params = {
				operator: 'ydelivery',
				type: 'courrier',
				function: 'request',
				data: item
			}

			if (!e.is_changed) {
				params.function = 'decorate'
			}

			SiteDelivery.external_dispatch(params)
		}

		else if(item.external_url){

			$('.js-geo-item-'+item.id).hide();

			checkExternalDelivery(item.external_url, item.id, country, region, city);

		}else{

			$('.js-geo-item-'+item.id).show();

		}

		$terms = checkTerms(item.id);
		if($terms != ''){
			$('.js-geo-item-'+item.id+' .js-geo-terms').html($terms);
			$('.js-geo-item-'+item.id+' .js-geo-terms', $('.geo-mini')).html(' — '+$terms);
		}

		if (e.is_changed) {
		

			$.ajax({
				type: 'PUT',
				url: '/payment/for_order.json?v2=true',
				data: 'order[delivery_variant_id]='+item.id,
				dataType: 'json'
			}).done(function(e){
				SiteDelivery.deliveries[item.id].payments = e.payments
				$payments = '';
				$i = 0;
				$.each(e.payments, function(index, item){
					$payments += ((item.description != '' && item.description != null)?'<div class="geo-table-item-p"><span class="geo-table-item-p-title geo-table-item-title-toggle js-geo-toggle">'+item.title+'</span><div class="geo-table-item-description">'+item.description+'</div></div>':'<div class="geo-table-item-p"><span class="geo-table-item-p-title">'+item.title+'</span></div>');
					if($paymentsVariants.indexOf(item.title) == -1){
						$paymentsVariants.push(item.title);
						if($i > 0) {
							$('.payments_item').append(', ');
						}                                  
						if($i == 0) $i = 1;
						$('.payments_item').append(item.title);                          
					}
				});
				$('.js-geo-item-'+item.id+' .js-geo-payments').html($payments);
			});

		}else{
			e.payments = SiteDelivery.deliveries[item.id].payments;
			$payments = '';
			$i = 0;
			$.each(e.payments, function(index, item){
				$payments += ((item.description != '' && item.description != null)?'<div class="geo-table-item-p"><span class="geo-table-item-p-title geo-table-item-title-toggle js-geo-toggle">'+item.title+'</span><div class="geo-table-item-description">'+item.description+'</div></div>':'<div class="geo-table-item-p"><span class="geo-table-item-p-title">'+item.title+'</span></div>');
				if($paymentsVariants.indexOf(item.title) == -1){
					$paymentsVariants.push(item.title);
					if($i > 0) {
						$('.payments_item').append(', ');
					}                                  
					if($i == 0) $i = 1;
					$('.payments_item').append(item.title);                          
				}
			});
			$('.js-geo-item-'+item.id+' .js-geo-payments').html($payments);
		}
	});
}




function checkGeo(){
	$('.js-geo-data').each(function(){
		$this = $(this)
		$modules = $this.data('modules').split('|');
		$this.html('<div class="geo-loader"></div>');
		$.each($modules, function(index, item){
			$this.append('<div class="geo-'+item+'" style="display:none;"></div>')
		});
	});
	if(geoMyCountries.length > 1){
		$geoMyCountries = '';
		$.each(geoMyCountries, function(index, item){
			$geoMyCountries += '<a href="#" class="geo-country geo-country-'+item.toLowerCase()+' js-geo-country'+((index == 0)?' active':'')+'" data-country="'+item+'"><i style="background-image:url(//cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.8.0/flags/4x3/'+item.toLowerCase()+'.svg);"></i>'+checkCountry(item)+'</a>'
		});
		$('.geo-countries').html($geoMyCountries).show();
	}else{
		$('.geo-countries').html('').hide();
	}
	if($.cookie('geoData')){
		$geoData = $.cookie('geoData').split('|');
		checkDelivery($geoData[0], $geoData[1], $geoData[2]);
		$('.js-minigeo').remove();
	}else{
		$.ajax({
			type: 'GET',
			url: '//kladr.insales.ru/current_location.json',
			cache: false,
			dataType: 'jsonp',
			success: function(e){
				if(e.country != undefined){
					$.cookie('geoRuCountry', (e.region+'|'+e.city), {expires: 365, path: '/'});
					checkDelivery(e.country, e.region, e.city);
				}else{
					$.cookie('geoRuCountry', 'Москва|Москва', {expires: 365, path: '/'});
					checkDelivery('RU', 'Москва', 'Москва');
				}
				$('.js-minigeo').animate({left: 0}, 100, function(){
					$('.js-minigeo').addClass('is-active').css('margin-left', $('.js-geo-city > a').width()/2);
				});
			},
			error: function(e){
				$.cookie('geoRuCountry', 'Москва|Москва', {expires: 365, path: '/'});
				checkDelivery('RU', 'Москва', 'Москва');
				$('.js-minigeo').animate({left: 0}, 100, function(){
					$('.js-minigeo').addClass('is-active').css('margin-left', $('.js-geo-city > a').width()/2);
				});
			}
		});
	}
}

function checkCountry(country){
	$country = 'Россия';
	$.each(geoCountries, function(index, item){
		if(index == country){
			$country = item;
		}
	});
	return $country;
}

function checkPhone(state){
	$phone = geoPhones['default'];
	$.each(geoPhones, function(index, item){
		if(index == state){
			$phone = item;
		}
	});
	$('.contacts .js-geo-phone').html('<a href="tel:'+$phone+'">'+$phone+'</a>');
}

function checkPopulars(country){
	$populars = '';
	$('.geo-populars').html($populars).hide();
	$.each(geoMyCityes, function(index,item){
		if(country == index){
			$country = index;
			$populars += '<div class="geo-popular geo-popular-'+$country.toLowerCase()+'">';
			$populars += '<p class="geo-popular-title">Популярные города</p>';
			$populars += '<div class="geo-popular-list">';
			$.each(item, function(index,item){
				if(item.indexOf('*') != -1){
					$populars += '<div class="geo-popular-city"><strong><span class="js-geo-popular-item geo-popular-item" data-popular="'+$country+'|'+index+'|'+item.replace('*','')+'">'+item.replace('*','')+'</span></strong></div>';
				}else{
					$populars += '<div class="geo-popular-city"><span class="js-geo-popular-item geo-popular-item" data-popular="'+$country+'|'+index+'|'+item.replace('*','')+'">'+item.replace('*','')+'</span></div>';
				}
			});
			$populars += '</div>';
			$populars += '</div>';
			$('.geo-populars').html($populars).show();
		}
	});
}

var	geoTermMin = 100;
var	geoTermMax = 0;
function checkMinTerms(term){
	geoTermMax = 0;
	termMin = term.split('-')[0];
	termMax = term.split('-')[term.split('-').length-1];
	if(termMin < geoTermMin){
		geoTermMin = termMin;
		minTerm = term;
	}else{
		geoTermMin = geoTermMin;
	}
	geoTermMax = (termMax > geoTermMax)?termMax:geoTermMax;
	if(geoTermMin != 100){
		$('.js-geo-minterms').html(' за <a href="'+geoDeliveryPageUrl+'" class="winbox" data-window="geo|geoTerm">'+minTerm+' '+declOfNum(minTerm.split('-')[minTerm.split('-').length-1],["день","дня","дней"])+'</a>').show();
	}
}
function checkTerms(id){
	$term = '';
	$.each(geoTerms, function(index, item){
		if(index == id){
			$item = item.split('-');
			$term = item+' '+declOfNum($item[$item.length-1],["день","дня","дней"]);
			checkMinTerms(item);
		}
	});
	return $term;
}

function checkDelivery(country, region, city){
	$('.js-minigeo').removeClass('is-active');
	$('.geo-loader').fadeIn(400);
	$geoCountry = checkCountry(country);
	$geoRuCountry = $.cookie('geoRuCountry').split('|');
	// если нет такого региона доставки то выставляем Россию
	if(geoMyCountries.indexOf(country) == -1){
		country = 'RU';
		region = 'Москва';
		city = 'Москва';
	}
	// *** //
	$('.geo-country').removeClass('active');
	$('.geo-country-'+country.toLowerCase()).addClass('active');
	if(country == 'RU'){
		if(region == ''){
			region = (($geoRuCountry[0] == '')?'Москва':$geoRuCountry[0]);
		}
		if(city == ''){
			city = (($geoRuCountry[1] == '')?'Москва':$geoRuCountry[1]);
		}
		$.cookie('geoRuCountry', (region+'|'+city), {expires: 365, path: '/'});
		if(geoIsUpdate){
          if(geo_active){
			$('.js-geo-city').html('<span>Ваш город:</span> <a href="'+geoDeliveryPageUrl+'" class="winbox" data-window="geo|geoCity">'+city+'</a><span class="js-geo-minterms"></span>');
          } else {
			$('.js-geo-city').html('<span>Ваш город:</span> '+city+'<span class="js-geo-minterms"></span>');            
          }
			$('.js-geo-mini').html('<div class="row"><div class="col-sm-6 col-xs-12"><div class="geo-mini-title">Доставка в город: <a href="'+geoDeliveryPageUrl+'" class="winbox" data-window="geo|geoCity">'+city+'</a></div><ul class="fa-ul geo-mini-table"></ul></div><div class="col-sm-6 col-xs-12"><div class="geo-mini-payments"><div class="geo-mini-title">Варианты оплаты</div><ul class="fa-ul geo-mini-payments-table"></ul></div></div></div>');
		
			if(template == 'checkout'){
			    $('[name="shipping_address[state]"]').val(region);
			    $('[name="shipping_address[city]"]').val(city);
			}
		}
		$('.js-geo-city-short').html('Город: <span>'+city+''+((region.replace('г ', '') != city)?', '+region:'')+'</span>');
		$('.js-geo-city-popup').html('Город доставки ваших покупок<br><strong>'+city+''+((region.replace('г ', '') != city)?', '+region:'')+'</strong>?');
		$('.geo-search').html('<input type="text" placeholder="Укажите населенный пункт" class="js-geo-search input-medium" value="'+city+'"><ul class="geo-search-results js-geo-search-results"></ul>').show();
		geoPvzCity = city+''+((region.replace('г ', '') != city)?', '+region:'');
	}else{
		if(geoIsUpdate){
			$('.js-geo-city').html('Доставка в страну:<br><a href="'+geoDeliveryPageUrl+'" class="winbox" data-window="geo|geoCity">'+$geoCountry+'</a><span class="js-geo-minterms"></span>');
			$('.js-geo-mini').html('<div class="row"><div class="col-sm-6 col-xs-12"><div class="geo-mini-title">Доставка в страну: <a href="'+geoDeliveryPageUrl+'" class="winbox" data-window="geo|geoCity">'+$geoCountry+'</a></div><ul class="fa-ul geo-mini-table"></ul></div><div class="col-sm-6 col-xs-12"><div class="geo-mini-payments"><div class="geo-mini-title">Варианты оплаты</div><ul class="fa-ul geo-mini-payments-table"></ul></div></div></div>');
		
			if(template == 'checkout'){
			    $('[name="shipping_address[state]"]').val(region);
			    $('[name="shipping_address[city]"]').val(city);
			}
		}
		$('.js-geo-city-short').html('Страна: <span>'+$geoCountry+'</span>');
		$('.js-geo-city-popup').html('Страна доставки ваших покупок<br><strong>'+$geoCountry+'</strong>?');
		$('.geo-search').html('').hide();
		geoPvzCity = $geoCountry;
	}
	$.cookie('geoData', (country+'|'+region+'|'+city), {expires: 365, path: '/'});
	$.cookie('geoCityHtml', $('.js-geo-city').html(), {expires: 365, path: '/'});
	$.cookie('geoMiniHtml', $('.js-geo-mini').html(), {expires: 365, path: '/'});
	checkPopulars(country);
	
	$.ajax({
		type: 'post',
		url: '//kladr.insales.ru/fulltext_search.json?country='+country+'&state=',
		data: {q: city, search: '1'},
		dataType: 'jsonp',
		cache: false,
		success: function(e){
			if(e.length > 0 && e.length !== undefined){
				geoKLADR = e[0];
				full_locality_name = geoKLADR.result;
			}else{
				geoKLADR = {};
				region = '';
				city = '';
				full_locality_name = '';
			}
			$.ajax({
				type: 'PUT',
				url: '/delivery/for_order.json?v2=true',
				data: 'shipping_address[kladr_json]='+JSON.stringify(geoKLADR)+'&order[delivery_variant_id]=&shipping_address[country]='+country+'&shipping_address[state]='+region+'&shipping_address[city]='+city+'&shipping_address[full_locality_name]='+full_locality_name,
				dataType: 'json'
			}).done(function(e){
				checkPhone(geoKLADR.state);


				$('.geo-loader').clearQueue().fadeOut(400);
				geoItemsPrice = e.order.items_price;
				geoTotalWeight = e.order.total_weight;
				// обновляем данные по гео из ответа
				if(city != e.order.shipping_address.city){
					if(e.order.shipping_address.city){
						country = e.order.shipping_address.country;
						region = e.order.shipping_address.region;
						city = e.order.shipping_address.city;
						$.cookie('geoData', (country+'|'+region+'|'+city), {expires: 365, path: '/'});
						if(country == 'RU'){
							$.cookie('geoRuCountry', (region+'|'+city), {expires: 365, path: '/'});
						}
					}
				}
				$('.js-geo-search').val(city);
				// *** //
				$('.geo-table').html('').hide();

				is_changed = false;

				if (typeof SiteDelivery.order.shipping_address !== 'undefined') {

					if (e.order.shipping_address.city != SiteDelivery.order.shipping_address.city) {
						is_changed = true				
					}
				}else{
					
						is_changed = true				
					


				}

				e.is_changed = is_changed

				if (!is_changed) {

					e.deliveries = SiteDelivery.deliveries 
					e.order = SiteDelivery.order
		
					
				}else{
					SiteDelivery.deliveries = e.deliveries 
					SiteDelivery.order = e.order
				}

				SiteDelivery.processed_variants(e);



				
			}).fail(function(e){
				//
			});
		}
	});
	geoIsUpdate = true;
}

var ipolhCourierItem = 0;


function checkExternalMap(url, id, country, region, city){
	$.ajax({
		type: 'GET',
		url: url,
		data: 'region='+region+'&city='+city+'&country='+country+'&weight='+geoTotalWeight+'&price='+geoItemsPrice,
		dataType: 'json',
        crossDomain: true,
		success: function(e){
			$('.js-geo-item-map').remove();
			$('.js-geo-item-'+id+' .js-geo-title', $('.geo-table')).append('<p class="js-geo-item-map"><a href="#" class="button button-bordered winbox" data-window="geoMap"><i class="fa fa-map-o" aria-hidden="true"></i>&nbsp;&nbsp;Посмотреть на карте</a></p>');
			$('.js-geo-item-'+id, $('.geo-mini-table')).append('<p class="geo-mini-table-item-map js-geo-item-map"><a href="#" class="link-bold winbox" data-window="geoMap">Посмотреть на карте</a></p>');
			var i = 0;
			geoPvzCoord = [];
			geoPvzCoord.length = 0;
			$.each(e.points, function(index, item){
				geoPvzCoord[i] = {'coordX':item.lat,'coordY':item.lng,'header':'<img src="//storage.apiship.ru/icons/providers/'+item.providerKey+'-30px.png" style="margin: 0px 0px 5px;">'+item.address,'body':'Время работы: '+item.timetable+'<br/>Телефон: '+item.phone,'name':item.name};
				i++;
			});
			$.each(e.providers, function(index, item){
				$days = item.days.toString();
				$term = $days.replace(/[^-0-9]/gim,'');
				$item = $term.split('-');
				if($item.length > 0){
					$('.js-geo-item-'+id+' .js-geo-terms').html($term+' '+declOfNum($item[$item.length-1],["день","дня","дней"]));
					$('.js-geo-item-'+id+' .js-geo-terms', $('.geo-mini')).html(' — '+$term+' '+declOfNum($item[$item.length-1],["день","дня","дней"]));
					if(ipolhCourierItem != 0){
						$('.js-geo-item-'+ipolhCourierItem+' .js-geo-terms').html($term+' '+declOfNum($item[$item.length-1],["день","дня","дней"]));
						$('.js-geo-item-'+ipolhCourierItem+' .js-geo-terms', $('.geo-mini')).html(' — '+$term+' '+declOfNum($item[$item.length-1],["день","дня","дней"]));
					}
					checkMinTerms($term);
				}
			});
		},
		error: function(e){
			//
		}
	});
}

function checkGeoMap(){
	$('.window-obj-geoMap .window-title').html('<span class="geo-city-short">Пункты выдачи: <span>'+geoPvzCity+'</span></span><a href="'+geoDeliveryPageUrl+'" class="button button-bordered winbox" data-window="geo|geoTerm">Другие способы доставки</a>');
	$('.js-geo-map').html('<div class="row"><div class="col-md-3 col-sm-12 col-xs-12"><div class="js-geo-pvz-select geo-pvz-select visible-sm visible-xs"><select class="js-pvz-select-toggle"></select></div><div class="js-geo-pvz-list geo-pvz-list hidden-sm hidden-xs"></div></div><div class="col-md-9 col-sm-12 col-xs-12"><div id="yaGeoMap" style="width: 100%; height: 500px;"></div></div></div>');
	ymaps.ready(init);
	var myMap, myPlacemark;
	geoPvzItems = new Array();
	geoPvzItems = [];
	function init(){
		myMap = new ymaps.Map('yaGeoMap', {
			center: [geoPvzCoord[0].coordX,geoPvzCoord[0].coordY],
			zoom: 10,
			controls: ['zoomControl', 'searchControl', 'typeSelector',  'geolocationControl']
		});
		myMap.behaviors.disable('scrollZoom');
		$.each(geoPvzCoord,function(index, item){
			var activeOptions, defaultOptions;
			activeOptions = {
				preset: 'islands#blueDotIcon',
				balloonPanelMaxMapArea: 'Infinity'
			};
			defaultOptions = {
				preset: 'islands#blackDotIcon',
				balloonPanelMaxMapArea: 'Infinity'
			};
			geoPvzItems[index] = new ymaps.Placemark([item.coordX,item.coordY], {
				balloonContentHeader: item.header,
				balloonContentBody: item.body,
				hintContent: item.header,
				defaultOptions: defaultOptions,
				activeOptions: activeOptions
			}, defaultOptions);
			myMap.geoObjects.add(geoPvzItems[index]);
			$('.js-geo-pvz-list').append('<p class="geo-pvz-list-item"><a href="#" class="js-pvz-list-item-toggle" data-index="'+index+'">'+item.name+'</a></p>')
			$('.js-geo-pvz-select select').append('<option>'+item.name+'</option>')
		});
		myMap.geoObjects.events.add('balloonopen', function(e){
			var activeGeoObject = e.get('target');
			activeGeoObject.options.set(activeGeoObject.properties.get('activeOptions'));
			myMap.geoObjects.each(function(geoObject){
				if(geoObject !== activeGeoObject){
					geoObject.options.set(geoObject.properties.get('defaultOptions'));
				}
			});
		});
		myMap.geoObjects.events.add('balloonclose', function(e){
			var activeGeoObject = e.get('target');
			activeGeoObject.options.set(activeGeoObject.properties.get('defaultOptions'));
		});
	}
}

$(function(){
//	if(geo_active){
		checkGeo();
//	}else{
//		$('.js-geo-data').hide();
//	}
	
	$('body').on('click', '.js-geo-toggle', function(e){
		e.preventDefault();
		$this = $(this);
		$this.toggleClass('active');
		$this.next().slideToggle(200);
	});
	
	$('body').on('click', '.js-geo-country', function(e){
		e.preventDefault();
		$this = $(this);
		$('.geo-country').removeClass('active');
		$this.addClass('active');
		checkDelivery($this.data('country'), '', '');
	});

	$geoSearchParent = $('.geo-search');
	$('body').on('blur', '.js-geo-search', function(e){
		$geoSearchParent = $(this).parent();
		$('.js-geo-search-results', $geoSearchParent).fadeOut();
	});

	$('body').on('click', '.js-geo-popular-item', function(e){
		$geoPopular = $(this).data('popular').split('|');
		checkDelivery($geoPopular[0], $geoPopular[1], $geoPopular[2]);
	});

	$('body').on('click', '.js-pvz-list-item-toggle', function(e){
		e.preventDefault();
		$itemIndex = $(this).data('index');
		geoPvzItems[$itemIndex].balloon.open();
	});

	$('body').on('click', '.js-pvz-select-toggle', function(e){
		e.preventDefault();
		$itemIndex = $(this).find('option:selected').index();
		geoPvzItems[$itemIndex].balloon.open();
	});

	$('body').on('click', '.js-minigeo-toggle', function(e){
		e.preventDefault();
		$('.js-minigeo').removeClass('is-active');
	});
	
	function geoSearch(){
		var geoSearchQuery = $('.js-geo-search', $geoSearchParent).val();
		var geoSearchResult = '';
		if(geoSearchQuery !== ''){
			$.ajax({
				type: 'post',
				url: '//kladr.insales.ru/fulltext_search.json?country=RU&state=',
				data: {q: geoSearchQuery, search: '1'},
				dataType: 'jsonp',
				cache: false,
				success: function(e){
					$.each(e, function(index, item){
						city = item.last_level.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)('+geoSearchQuery+')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<strong>$1</strong>');
						if(item.last_level != item.state){
							state = item.state+' '+item.state_type;
						}else{
							state = item.state;
						}
						geoSearchResult += '<li class="geo-search-result"><a href="#" onclick="checkDelivery(\'RU\', \''+state+'\', \''+item.last_level+'\'); return false;"><span class="geo-search-result-title">'+city+'</span><span class="geo-search-result-subtitle">'+item.result+'</span></a></li>';
					});
					if(geoSearchResult == ''){
						geoSearchResult = '<li class="geo-search-result"><a href="#" onclick="checkDelivery(\'RU\', \'\', \'\'); return false;"><span class="geo-search-result-title">Ничего не найдено</span><span class="geo-search-result-subtitle">Проверьте правильность написания или выберите ближайший к вам населенный пункт</span></a></li>';
					}
					$('.js-geo-search-results', $geoSearchParent).html(geoSearchResult);
				}
			});
		}
		return false; 
	}
	$('body').on('keyup', '.js-geo-search', function(e){
		$geoSearchParent = $(this).parent();
		clearTimeout($.data(this, 'timer'));
		var geoSearchString = $(this).val();
		if(geoSearchString == ''){
			$('.js-geo-search-results', $geoSearchParent).fadeOut();
		}else{
			$('.js-geo-search-results', $geoSearchParent).fadeIn();
			$(this).data('timer', setTimeout(geoSearch, 100));
		};
	});
	$('body').on('focus', '.js-geo-search', function(e){
		$geoSearchParent = $(this).parent();
		clearTimeout($.data(this, 'timer'));
		var geoSearchString = $(this).val();
		if(geoSearchString == ''){
			$('.js-geo-search-results', $geoSearchParent).fadeOut();
		}else{
			$('.js-geo-search-results', $geoSearchParent).fadeIn();
			$(this).data('timer', setTimeout(geoSearch, 100));
		};
	});
});

// регион и номер телефона, первый вариант - общий если регоина нет в списке (соблюдайте формат, у последнего варианта нет запятой в конце!)
var geoPhones = {
	/*"default":account_phone,
	"Москва":"8 (495) 123-45-67",
	"Московская":"8 (495) 123-45-67",
	"Санкт-Петербург":"8 (812) 987-65-43",
	"Ленинградская":"8 (812) 987-65-43"*/
}

// id варианта доставки и сроки (соблюдайте формат, у последнего варианта нет запятой в конце!)
var geoTerms = {
	"290661":"7-10",
	"801683":"10-15",
	"801527":"2",
	"807371":"8-10"
}

// коды стран в которые осуществляется доставка (соблюдайте формат, у последнего варианта нет запятой в конце!)
var geoMyCountries = [
	"RU"
]

// популярные города доставки пока только для России (соблюдайте формат, у последнего варианта нет запятой в конце!)
var geoMyCityes = {
	"RU":{
		"Москва":"*Москва",
		"Санкт-Петербург":"*Санкт-Петербург",
		"Свердловская обл.":"Екатеринбург",
		"Саратовская обл.":"Саратов",
		"Самарская обл.":"Самара",
		"Новосибирская обл.":"Новосибирск",
		"Ростовская обл.":"Ростов-на-Дону",
		"Краснодарский край":"Краснодар",
		"Нижегородская обл.":"Нижний Новгород",
		"Тюменская обл.":"Тюмень",
		"Иркутская обл.":"Иркутск",
		"Красноярский край":"Красноярск",
		"Тверская обл.":"Тверь",
		"Башкортостан респ.":"Уфа",
		"Тульская обл.":"Тула"
	}
}

var geoCountries = {
    "AU":"Австралия","AT":"Австрия","AZ":"Азербайджан","AL":"Албания","DZ":"Алжир","AS":"Американское Самоа","AI":"Ангилья","AO":"Ангола","AD":"Андорра","AQ":"Антарктида","AG":"Антигуа и&nbsp;Барбуда","AR":"Аргентина","AM":"Армения","AW":"Аруба","AF":"Афганистан","BS":"Багамы","BD":"Бангладеш","BB":"Барбадос","BH":"Бахрейн","BZ":"Белиз","BY":"Беларусь","BE":"Бельгия","BJ":"Бенин","BM":"Бермудские острова","BG":"Болгария","BO":"Боливия","BA":"Босния и&nbsp;Герцеговина","BW":"Ботсвана","BR":"Бразилия","IO":"Британская территория в&nbsp;Индийском океане","BN":"Бруней-Даруссалам","BF":"Буркина-Фасо","BI":"Бурунди","BT":"Бутан","VU":"Вануату","GB":"Великобритания","HU":"Венгрия","VE":"Венесуэла","VG":"Виргинские острова, Британские","VI":"Виргинские острова, США","VN":"Вьетнам","GA":"Габон","HT":"Гаити","GY":"Гайана","GM":"Гамбия","GH":"Гана","GP":"Гваделупа","GT":"Гватемала","GN":"Гвинея","GW":"Гвинея-Бисау","DE":"Германия","GG":"Гернси","GI":"Гибралтар (Великобритания)","HN":"Гондурас","HK":"Гонконг","GD":"Гренада","GL":"Гренландия","GR":"Греция","GE":"Грузия","GU":"Гуам","DK":"Дания","JE":"Джерси","DJ":"Джибути","DM":"Доминика","DO":"Доминиканская Республика","EG":"Египет","ZM":"Замбия","EH":"Западная Сахара","ZW":"Зимбабве","IL":"Израиль","IN":"Индия","ID":"Индонезия","JO":"Иордания","IQ":"Ирак","IR":"Иран, Исламская Республика","IE":"Ирландия","IS":"Исландия","ES":"Испания","IT":"Италия","YE":"Йемен","CV":"Кабо-Верде","KZ":"Казахстан","KH":"Камбоджа","CM":"Камерун","CA":"Канада","QA":"Катар","KE":"Кения","CY":"Кипр","KG":"Киргизия","KI":"Кирибати","CN":"Китай","CC":"Кокосовые (Килинг) острова","CO":"Колумбия","KM":"Коморы","CG":"Конго","CD":"Конго, Демократическая Республика","CR":"Коста-Рика","CI":"Кот д'Ивуар","CU":"Куба","KW":"Кувейт","LA":"Лаос","LV":"Латвия","LS":"Лесото","LR":"Либерия","LB":"Ливан","LY":"Ливийская Арабская Джамахирия","LT":"Литва","LI":"Лихтенштейн","LU":"Люксембург","MU":"Маврикий","MR":"Мавритания","MG":"Мадагаскар","YT":"Майотта","MO":"Макао","MW":"Малави","MY":"Малайзия","ML":"Мали","UM":"Малые Тихоокеанские отдаленные острова Соединенных Штатов","MV":"Мальдивы","MT":"Мальта","MA":"Марокко","MQ":"Мартиника","MH":"Маршалловы острова","MX":"Мексика","FM":"Микронезия, Федеративные Штаты","MZ":"Мозамбик","MD":"Молдова, Республика","MC":"Монако","MN":"Монголия","MS":"Монтсеррат","MM":"Мьянма","NA":"Намибия","NR":"Науру","NP":"Непал","NE":"Нигер","NG":"Нигерия","AN":"Нидерландские Антилы","NL":"Нидерланды","NI":"Никарагуа","NU":"Ниуэ","NZ":"Новая Зеландия","NC":"Новая Каледония","NO":"Норвегия","AE":"Объединенные Арабские Эмираты","OM":"Оман","BV":"Остров Буве","IM":"Остров Мэн","NF":"Остров Норфолк","CX":"Остров Рождества","HM":"Остров Херд и&nbsp;острова Макдональд","KY":"Острова Кайман","CK":"Острова Кука","TC":"Острова Теркс и&nbsp;Кайкос","PK":"Пакистан","PW":"Палау","PS":"Палестинская территория, оккупированная","PA":"Панама","VA":"Папский Престол (Государство&nbsp;— город Ватикан)","PG":"Папуа-Новая Гвинея","PY":"Парагвай","PE":"Перу","PN":"Питкерн","PL":"Польша","PT":"Португалия","PR":"Пуэрто-Рико","MK":"Республика Македония","RE":"Реюньон","RU":"Россия","RW":"Руанда","RO":"Румыния","WS":"Самоа","SM":"Сан-Марино","ST":"Сан-Томе и&nbsp;Принсипи","SA":"Саудовская Аравия","SZ":"Свазиленд","SH":"Святая Елена","KP":"Северная Корея","MP":"Северные Марианские острова","SC":"Сейшелы","PM":"Сен-Пьер и&nbsp;Микелон","SN":"Сенегал","VC":"Сент-Винсент и&nbsp;Гренадины","KN":"Сент-Китс и&nbsp;Невис","LC":"Сент-Люсия","RS":"Сербия","SG":"Сингапур","SY":"Сирийская Арабская Республика","SK":"Словакия","SI":"Словения","US":"Соединенные Штаты","SB":"Соломоновы острова","SO":"Сомали","SD":"Судан","SR":"Суринам","SL":"Сьерра-Леоне","TJ":"Таджикистан","TH":"Таиланд","TW":"Тайвань (Китай)","TZ":"Танзания, Объединенная Республика","TL":"Тимор-Лесте","TG":"Того","TK":"Токелау","TO":"Тонга","TT":"Тринидад и&nbsp;Тобаго","TV":"Тувалу","TN":"Тунис","TM":"Туркмения","TR":"Турция","UG":"Уганда","UZ":"Узбекистан","UA":"Украина","WF":"Уоллис и&nbsp;Футуна","UY":"Уругвай","FO":"Фарерские острова","FJ":"Фиджи","PH":"Филиппины","FI":"Финляндия","FK":"Фолклендские острова (Мальвинские)","FR":"Франция","GF":"Французская Гвиана","PF":"Французская Полинезия","TF":"Французские Южные территории","HR":"Хорватия","CF":"Центрально-Африканская Республика","TD":"Чад","ME":"Черногория","CZ":"Чешская Республика","CL":"Чили","CH":"Швейцария","SE":"Швеция","SJ":"Шпицберген и&nbsp;Ян&nbsp;Майен","LK":"Шри-Ланка","EC":"Эквадор","GQ":"Экваториальная Гвинея","AX":"Эландские острова","SV":"Эль-Сальвадор","ER":"Эритрея","EE":"Эстония","ET":"Эфиопия","GS":"Южная Джорджия и&nbsp;Южные Сандвичевы острова","KR":"Южная Корея","ZA":"Южно-Африканская Республика","JM":"Ямайка","JP":"Япония"
}
