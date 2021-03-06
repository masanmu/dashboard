
angular.module('app', ['ui.bootstrap.datetimepicker', 'app.util'])
.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
})
.controller('MultiCtrl', MultiCtrl)

function MultiCtrl(FlotServ, $scope, $interval, $timeout,$http) {
    var vm = this;

    // 全局的参数
    vm.defaultGlobalParam = {
        start: '',
        end: '',
	time_range:'-3600',
        cf: 'AVERAGE', // MIN, MAX
        graph_type: 'h', // h Endpoint视角; k Counter视角
        sum: 'off' // off
    };
    vm.globalParam = angular.copy(vm.defaultGlobalParam);


    // var urlH = '/chart/h';
    // var urlK = '/chrt/k;
    var backendParam = FlotServ.getParam(); // 后端渲染出来的参数
    vm.globalParam.graph_type = backendParam.graph_type;

    vm.chart = {}; // 前端的图, 对应后端的返回
    vm.configs = []; // 绘图的数据, 多个
    vm.data = []; // 缓存的绘图数据, 不会改变
    // vm.param = angular.copy(defaultParam);


    vm.all = true; // 是否全选
    vm.reverse = false; // 是否反选

    vm.checkAll = checkAll;
    vm.checkReverse = checkReverse;
    vm.checkSearch = checkSearch;
    vm.reset = reset;
    vm.show = show;
    vm.save = save;
    vm.pageScroll = pageScroll;

    $scope.$watch('vm.globalParam.graph_type', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            // change url
            var url = window.location.href;
            var newUrl;
            if (newVal === 'k') {
                newUrl = url.replace('graph_type=h', 'graph_type=k').replace('graph_type=a', 'graph_type=k');
            } else if (newVal === 'h') {
                newUrl = url.replace('graph_type=k', 'graph_type=h').replace('graph_type=a', 'graph_type=h');
            } else {
                newUrl = url.replace('graph_type=h', 'graph_type=a').replace('graph_type=k', 'graph_type=a');
            }
            window.location.href = newUrl;
        }
    });
    var cur = 0 //加载图片id在数组中的索引
    //根据配置文件中设置的最大加载图片，超过设置会启用懒加载
    var $loadMoreBtn = $("#load-more")
//    var loadmore = 0
    var clock
    var loadmore_index = 0
    var chart_ids = new Array()
    var chart_urls = new Array()
    $("#time_range").attr("disabled","disabled")
    lazyload(0)	
    disable(true)
    function disable(onoff){
    	$("#time_range").attr("disabled",onoff)
	$("#go").attr("disabled",onoff)
	$("#reset").attr("disabled",onoff)
	$("#save_screen").attr("disabled",onoff)
    }
    // reset 重置
    function reset() {
    	vm.globalParam.start=''
        vm.globalParam.end=''
        vm.globalParam.cf='AVERAGE'
        vm.globalParam.sum='of'
        vm.globalParam.time_range='-3600'
    	show(0)
    }

    // show 看图
    function show(flag) {
	if(clock){
		return;
	}
	disable("true")
	vm.configs = []
//	loadmore = 1
	loadmore_index = 0
	lazyload(flag)
    }
    // save保存图
    function save() {
	var url = window.location.href.split("/")[0];
	var newurl = url+"/screen/add"
	var group_name = prompt("Group screen:")
	var screen_name = prompt("Screen name:") 
	var group_name_postdata = {
		"screen_name":group_name
		}
	$http.post(newurl,group_name_postdata)
	.success(function(data,status,header,config){
		var screen_name_postdata = {
			"screen_name":screen_name,
			"pid":data
		}
		$http.post(newurl,screen_name_postdata)
			.success(function(data,status,header,config){
				var screen_url =url + "/screen/"+data
				if (vm.globalParam.graph_type === 'h'){
					graph_type_h(screen_url)
				}
				if (vm.globalParam.graph_type === 'k'){
					graph_type_k(screen_url)
				}
				if ( vm.globalParam.graph_type === 'a' ){
					graph_type_a(screen_url)
				}
			})
			.error(function(data,status,header,config){})
	})	
	.error(function(){})
    }

    // graph_type = h
    function graph_type_h(screen_url){
	var hosts = new Array()
	for(con in vm.configs[0].config){
		hosts[con] = vm.configs[0].config[con].label
	}
    	for(con in vm.configs){
		var graph_postdata = {
			"title":vm.configs[con].config[0].label,
			"hosts":hosts,
			"counters":vm.configs[con].title,
			"graph_type":"h"
		}
		post_data(graph_postdata,screen_url)
	}
    }

    // graph_type = k
    function graph_type_k(screen_url){
	var counters = new Array() 
	var hosts = new Array()
	for(con in vm.configs[0].config){
		counters[con] = vm.configs[0].config[con].label
	}
	for(con in vm.configs){
		var graph_postdata = {
			"title":vm.configs[con].title,
			"hosts":vm.configs[con].title,
			"counters":counters,
			"graph_type":"k",
		}
    		post_data(graph_postdata,screen_url)
    	}
    }

    // graph_type = a
    function graph_type_a(screen_url){
	var counters = new Array() 
	var hosts = new Array() 
    	for(con in vm.configs[0].config){
		counter = vm.configs[0].config[con].label.split(" ")
		hosts[con] = counter[0]
		counters[con] = counter.slice(1).join(" ")
	}
	var graph_postdata = {
		"title":" 自行指定",
		"hosts":hosts,
		"counters":counters,
		"graph_type":"a",
	}
	post_data(graph_postdata,screen_url)
    }

    // post_data
    function post_data(post_data,screen_url){
    	$http.post(screen_url+"/graph",post_data)
		.success(function(data,status,header,config){
		})
		.error(function(data,status,header,config){
		})
    }

    function lazyload(flag){
//	if(loadmore){
		cur = 0;
//	}
    	clock = setInterval(function(){
    	    index = {
    	            "index":cur
    	    }
	    if(vm.configs.length == FlotServ.getAllGraph()){
//	    if(cur>FlotServ.getAllGraph()){
	    	clearInterval(clock);
		clock = 0;
		disable(false);
		return;
	    }	
	    cur += FlotServ.getMaxLoadGraph()
	    url = window.location.href.replace(/charts/,"api/charts")
    	    $http.get(url,{params:index})
    	            .success(function(data,status,header,config){
    	                    chart_ids = data.chart_ids
    	                    chart_urls = data.chart_urls
    	                    active(vm.globalParam,flag)
    	            })
    	            .error(function(status){
       	         })
    	},300)
    }

    // active
    function active(param,flag) {
        // console.log(FlotServ.getUrls());
        var p = angular.copy(param);
	var now = new Date();
	if(flag){
		p.start = parseInt(+now/1000) + parseInt(p.time_range);
		p.end = parseInt(+now/1000);
	}else{
        	if (angular.isDate(p.start)) {
        	    p.start = +p.start/1000;
        	}
        	if (angular.isDate(p.end)) {
        	    p.end = +p.end/1000;
        	}
	}
	FlotServ.getMultiDataById(p,chart_ids).then(function(ret) {
            // [{data: {}}, {data: {}}, {data: {}}]
            // console.log(ret);
            var data;
            data = _.map(ret, function(i) {
                var o = {};
                o.config = FlotServ.parseData(i.data);
                o.title = i.data.title;
                return o;
            });
//	    if(loadmore){
//		index = loadmore_index*FlotServ.getMaxLoadGraph()
//		for(i in data){
//			vm.configs[index] = data[i]
//			index += 1
//		}
//		loadmore_index+=1
//	    }else{
	    	vm.configs.push.apply(vm.configs,data)
//	    }
  	});
    }

    // 全选
    function checkAll() {
        if (vm.all) {
            _.each(vm.data, function(d) {
                d.check = true;
            });
        } else {
            _.each(vm.data, function(d) {
                d.check = false;
            });
        }
        // vm.config = vm.data;
    }


    // 反选
    function checkReverse () {
        if (vm.reverse) {
            vm.all = false;
            _.each(vm.data, function(d) {
                d.check = !d.check;
            });
        }
        // vm.config = vm.data;
    }

    // 确定
    function checkSearch() {
        var data2 = [];
        _.each(vm.data, function(d) {
            if (d.check) {
                data2.push(d);
            }
        });
        vm.config = data2;
        // vm.series = data2;
        // flot = $.plot(el, val, FlotServ.getConfig());
    }

    function pageScroll() { 
	$(window).scrollTop(0)
    }
}
