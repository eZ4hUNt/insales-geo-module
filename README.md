# Гео-модуль для InSales
![Гео-модуль для InSales (Preview #1)](https://github.com/eZ4hUNt/insales-geo-module/blob/master/preview%20%231.jpg)
![Гео-модуль для InSales (Preview #2)](https://github.com/eZ4hUNt/insales-geo-module/blob/master/preview%20%232.jpg)
1. Добавляем в настройки темы
```
	<fieldset>
		<legend>ГЕО модуль</legend>
		<table>
			<tr>
				<td><label for="geo_active">Включить</label></td>
				<td><input name="geo_active" id="geo_active" type="checkbox"></td>
			</tr>
			<tr>
				<td><label for="header_geo">Показывать в шапке</label></td>
				<td><input name="header_geo" id="header_geo" type="checkbox"></td>
			</tr>
			<tr>
				<td><label for="header_geo_popup">Спрашивать при первом заходе правильно ли определен город</label></td>
				<td><input name="header_geo_popup" id="header_geo_popup" type="checkbox"></td>
			</tr>
		</table>
	</fieldset>
```
2. Добавляем в шапку
```
    {% if settings.geo_active and settings.header_geo %}
      <script>
        var geo_active = {% if settings.geo_active %}true{% else %}false{% endif %};
      </script>
      <div class="geo-city-header pull-left">
	    <div class="geo-city js-geo-city">Ваш город: </div>
		{% if settings.header_geo_popup %}
	      <div id="minigeo" class="minigeo header-icons-item-popup js-minigeo">
			<div class="header-icons-item-popup-content">
			  <p><span class="js-geo-city-popup">Город доставки ваших покупок<br><strong>&hellip;</strong>?</span></p>
			  <div class="minigeo_buttons">
				  <button class="button button-block button-accept js-minigeo-toggle">Да, все верно</button>
				  <button class="button button-block button-bordered winbox" data-window="geo|geoCity">Нет, сменить город</button>
			  </div>
			</div>
		  </div>
		{% endif %}
	  </div>
	{% endif %}
```
3. Подключаем *modul-geo.js*
4. Подключаем *modul-geo.css*
5. Подключаем стили из файла *styles.css*
5. Подключаем скрипт из файла script.js
