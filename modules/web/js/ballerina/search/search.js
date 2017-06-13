/**
 * Copyright (c) 2016-2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import log from 'log';
import $ from 'jquery';
import Backbone from 'backbone';
import EventChannel from 'event_channel';

const instance = null;


class Search extends EventChannel {
  constructor() {
    super();
    _.extend(this, Backbone.Events);
    const self = this;
    this.el = $('#modalSearch');
    this.search_box = $('#modal-search-field');
    this.list = $('.search-results > ul');

    this.template = _.template('<li class="list-group-item" data-key="<%= key %>"><%= item %></li>');

        // add events
    this.el.on('shown.bs.modal', () => {
      self.search_box.focus();
    });

    this.search_box.on('keydown keyup paste', _.bindKey(this, 'search'));
    this.list.on('click', 'li', _.bindKey(this, 'select'));
  }

  show() {
    this.search_box.val('');
    this.result = this.adapter.search('');
    this.render(this.result);
    this.el.modal();
  }

  hide() {
    this.el.modal('hide');
  }

  search(e) {
    const text = this.search_box.val();
    this.result = this.adapter.search(text);
    this.render(this.result);
  }

  setAdapter(a) {
    this.adapter = a;
  }

  render(result) {
    let html = '';
    const adapter = this.adapter;
    const self = this;
    _.forEach(this.result, (value, key) => {
      const item = adapter.render(value);
      html += self.template({ item, key });
    });
    this.list.html(html);
  }

  select(e) {
    const key = $(e.target).attr('data-key');
    this.trigger('select', this.result[key]);
    this.hide();
  }
}

export default function getSearch(adapter) {
  if (adapter == undefined) {
    throw 'Undefined adapter passed for search box.';
  }
  const i = (instance || new Search());
  i.setAdapter(adapter);
  return i;
}

