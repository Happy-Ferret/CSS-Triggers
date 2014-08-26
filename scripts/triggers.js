/*
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var TRIGGERS = {};

TRIGGERS.Filter = (function() {
  "use strict";

  var noResultsMessage = document.querySelector('.no-results-message');
  var filterContainer = document.querySelector('.filter-container');
  var filterText = document.querySelector('.filter-text');
  var filterForm = document.querySelector('.filter-form');
  var filterInput = document.querySelector('.filter');

  var propertyContainer = document.querySelector('.property-container');
  var properties = document.querySelectorAll('.property');

  filterForm.addEventListener('submit', onSubmitForm);
  filterForm.addEventListener('reset', onChangeFilter);
  filterInput.addEventListener('input', onChangeFilter);

  function onSubmitForm(evt) {
    evt.preventDefault();
    filterInput.blur();
  }

  function onChangeFilter(evt) {

    var visibleCount = 0;
    var filterValue = filterInput.value.replace(/[^a-z\-]*/ig, '');
    var property;

    if (evt.type === 'reset')
      filterValue = '';

    for (var p = 0; p < properties.length; p++) {
      property = properties[p];
      if (property.dataset['name'].indexOf(filterValue) >= 0) {
        property.classList.remove('hidden');
        visibleCount++;
      }
      else
        property.classList.add('hidden');
    }

    if (visibleCount === 0) {
      document.documentElement.classList.add('no-results');
      filterText.textContent = filterValue;
    }
    else {
      document.documentElement.classList.remove('no-results');
    }
  }

})();

TRIGGERS.LegendViewHandler = (function() {

  var legendView = document.querySelector('.legend');
  var legendOpenBtn = document.querySelector('.toggle-legend');
  var legendCloseBtn = legendView.querySelector('.close-button');
  var isModal = true;
  var resizeTimeout = 0;

  function onPressOpenButton(evt) {
    legendView.classList.add('visible');
  }

  function onPressCloseButton(evt) {
    legendView.classList.remove('visible');
  }

  function onResizeWindow() {

    isModal = (window.innerWidth < 1030);

    if (!isModal)
      onPressCloseButton();

    legendView.classList.remove('active');
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      legendView.classList.add('active');
    }, 100);
  }

  function init() {
    legendOpenBtn.addEventListener('click', onPressOpenButton);
    legendCloseBtn.addEventListener('click', onPressCloseButton);
    window.addEventListener('resize', onResizeWindow);
    onResizeWindow();
  }

  init();

})();

TRIGGERS.DetailsViewHandler = (function() {

  "use strict";

  var properties = document.querySelectorAll('.property');
  var detailsView = document.querySelector('.property-description-container');
  var detailsCloseBtn = detailsView.querySelector('.close-button');
  var isModal = true;
  var resizeTimeout = 0;

  function onChooseItem(evt) {

    var target = evt.currentTarget;
    var chosenItem = target.dataset['name'];
    var detailsTitle = detailsView.querySelector('.property-description-title');
    var detailsText = detailsView.querySelector('.property-description-text');

    if (typeof chosenItem === 'undefined')
      return;

    for (var p = 0; p < properties.length; p++)
      properties[p].classList.remove('selected');

    target.classList.add('selected');

    var itemInitial = target.dataset['initial'];
    var itemChange = target.dataset['change'];
    var text = TRIGGERS.Messages[itemInitial];

    detailsTitle.innerHTML = chosenItem;
    detailsText.innerHTML = text.replace(/{{property}}/, chosenItem);

    if (!isModal)
      return;

    detailsView.classList.add('visible');
    lockWindow();
  }

  function onPressCloseButton(evt) {
    detailsView.classList.remove('visible');
    unlockWindow();
  }

  function lockWindow() {
    document.documentElement.classList.add('locked');
  }

  function unlockWindow() {
    document.documentElement.classList.remove('locked');
  }

  function onScrollWindow() {
    if (window.scrollY > 338)
      detailsView.classList.add('sticky');
    else
      detailsView.classList.remove('sticky');
  }

  function onResizeWindow() {

    isModal = (window.innerWidth < 1030);

    if (!isModal)
      onPressCloseButton();

    detailsView.classList.remove('active');
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      detailsView.classList.add('active');
    }, 100);
  }

  function init() {
    for (var p = 0; p < properties.length; p++)
      properties[p].addEventListener('click', onChooseItem);

    detailsCloseBtn.addEventListener('click', onPressCloseButton);
    window.addEventListener('resize', onResizeWindow);
    window.addEventListener('scroll', onScrollWindow);
    onResizeWindow();
    onScrollWindow();
  }

  init();
})();

TRIGGERS.Messages = {
  "true,true,true": "<p>Changing <code>{{property}}</code> alters the geometry of the element. That means that it may affect the position or size of other elements on the page, both of which require the browser to perform <strong class=\"layout\">layout</strong> operations.</p><p>Once those layout operations have completed any damaged pixels will need to be <strong class=\"paint\">painted</strong> and the page must then be <strong class=\"composite\">composited</strong> together.</p>",

  "false,true,true": "<p>Changing <code>{{property}}</code> does not trigger any geometry changes, which is good. But since it is a visual property, it will cause <strong class=\"paint\">painting</strong> to occur. Painting is typically a super expensive operation, so you should be cautious.</p><p>Once any pixels have been painted the page will be <strong class=\"composite\">composited</strong> together.</p>",

  "false,false,true": "<p>Changing <code>{{property}}</code> does not trigger any geometry changes or painting, which is very good. This means that the operation can likely be carried out by the <strong>compositor thread</strong> with the help of the GPU.</p>",

  "true,false,true": "<p>Changing <code>{{property}}</code> alters the geometry of the element. That means that it may affect the position or size of other elements on the page, both of which require the browser to perform <strong class=\"layout\">layout</strong> operations.</p><p>Once those layout operations have completed any damaged pixels will need to be <strong class=\"paint\">painted</strong>, although in this case not immediately (it doesn't trigger paint) and the page must then be <strong class=\"composite\">composited</strong> together.</p>"

};

