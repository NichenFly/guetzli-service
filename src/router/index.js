import Vue from 'vue'
import Router from 'vue-router'
import Guetzli from '@/components/guetzli'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'guetzli',
        component: Guetzli
    }]
})