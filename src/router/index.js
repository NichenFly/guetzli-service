import Vue from 'vue'
import Router from 'vue-router'
import Guetzli from '@/components/guetzli'
import VueSocketio from 'vue-socket.io'

const dev = process.env.NODE_ENV !== 'production'

Vue.use(Router)
Vue.use(VueSocketio, dev ? ':5000/' : '')

export default new Router({
    routes: [{
        path: '/',
        name: 'guetzli',
        component: Guetzli
    }]
})