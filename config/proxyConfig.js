module.exports = {
    proxy: {
        '/api/': {
            target: 'http://127.0.0.1:5000',  // 接口域名
            changeOrigin: true,  //是否跨域
            pathRewrite: {
                '/login': '/login',   //需要rewrite的,
                '/logout': '/logout'
            }
        }
    }
}