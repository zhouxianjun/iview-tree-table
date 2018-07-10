import Vue from 'vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import Example from './Example';

Vue.use(iView);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    template: '<Example/>',
    components: { Example}
});
