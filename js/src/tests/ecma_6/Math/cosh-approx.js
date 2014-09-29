var sloppy_tolerance = 100;

assertEq(Math.cosh(1000), Infinity);
assertEq(Math.cosh(Number.MAX_VALUE), Infinity);
assertNear(Math.cosh(1e-30), 1, sloppy_tolerance);
assertNear(Math.cosh(1e-10), 1, sloppy_tolerance);

var cosh_data = [
    [0.0016914556651292944, 1.0000014305114746],
    [0.001953124689559275, 1.0000019073486328],
    [0.003782208044661295, 1.000007152557373],
    [0.005258943946801101, 1.000013828277588],
    [0.005859366618129203, 1.0000171661376953],
    [0.010961831992188852, 1.0000600814819336],
    [0.015285472131830425, 1.0001168251037598],
    [0.017249319093529877, 1.0001487731933594],
    [0.028218171738655373, 1.0003981590270996],
    [0.03573281468231457, 1.000638484954834],
    [0.046287402472878776, 1.0010714530944824],
    [0.07771996527168971, 1.0030217170715332],
    [0.0998975930860278, 1.0049939155578613],
    [0.13615938768032465, 1.0092840194702148],
    [0.21942279004958354, 1.024169921875],
    [0.3511165938166055, 1.0622773170471191],
    [0.48975026711288183, 1.1223440170288086],
    [0.692556883708491,  1.2495574951171875],
    [0.954530572221414,  1.4912219047546387],
    [1.307581416910453,  1.983847141265869],
    [1.4035188779741334, 2.1576128005981445],
    [1.5250070845427517, 2.406397819519043],
    [1.8905372013072799, 3.386958122253418],
    [2.1735673399948254, 4.451677322387695],
    [2.625091127868242,  6.939132690429686],
    [2.737434918695162,  7.756023406982421],
    [2.8740317167801948, 8.88236999511719],
    [2.97998639328949,   9.869171142578123],
    [3.516549380542481,  16.848876953125],
    [3.51867003468025,   16.884582519531254],
    [3.593185165198829,  18.18859100341797],
    [3.6273672142963385, 18.82012176513672],
    [3.646553244410946,  19.184181213378906],
    [3.872413451393967,  24.03952026367187],
    [3.972085568933329,  26.556991577148434],
    [4.022209178119238,  27.921104431152337],
    [4.168428891496629,  32.31466674804686],
    [4.240546229861005,  34.730087280273445],
    [4.290698214968891,  36.51556396484376],
    [4.352722738491574,  38.851287841796875],
    [4.594386162629449,  49.46875],
    [4.598500387004538,  49.67265319824219],
    [4.7152173401856095, 55.821014404296896],
    [4.73822104001982,   57.119781494140604],
    [4.793733825338029,  60.37983703613279],
    [4.8435923769530165, 63.46618652343747],
    [4.849190310904695,  63.82241821289062],
    [4.85767897228448,   64.36642456054685],
    [4.880061548144127,  65.82318115234375],
    [4.921430721025434,  68.60302734374997],
    [4.94406835208057,   70.17358398437497],
    [4.967000841791218,  71.80126953124997],
    [5.016014824864732,  75.40786743164065],
    [5.017205657609766,  75.49771118164062],
    [5.0506448716550825, 78.06475830078126],
    [5.0707363201405276, 79.64892578125],
    [5.073517411135063,  79.87072753906253],
    [5.101574796209937,  82.14324951171874],
    [5.152357710985635,  86.4221496582031],
    [5.167705692500117,  87.75869750976562],
    [5.2390637098028074, 94.24942016601562],
    [5.247023676519904,  95.00259399414062],
    [5.258134994273664,  96.06402587890626],
    [5.289261389093961,  99.10101318359374],
    [5.345425863147171,  104.82595825195315],
    [5.3555664787245885, 105.89431762695308],
    [5.363617180711895,  106.750244140625],
    [5.388152468690488,  109.40167236328122],
    [5.405320225963013,  111.2959899902344],
    [5.417698597745429,  112.68215942382815],
    [5.445406415908933,  115.8478698730469],
    [5.501396249028249,  122.51895141601562],
    [5.531718947357248,  126.29083251953128],
    [5.544277233951787,  127.88677978515626],
    [5.547444176085567,  128.29241943359372],
    [5.556786759298988,  129.49658203125006],
    [5.625710723366437,  138.7365112304687],
    [5.628934733085022,  139.18450927734378],
    [5.634566685055491,  139.97058105468747],
    [5.660401141376928,  143.63366699218747],
    [5.698541939965668,  149.21765136718753],
    [5.7078698961812995, 150.6160278320313],
    [5.714741890601693,  151.6546020507813],
    [5.735111323217677,  154.77532958984378],
    [5.761781191641161,  158.95861816406253],
    [5.763503378028959,  159.23260498046878],
    [5.810483079631769,  166.89166259765622],
    [5.824362807770767,  169.22418212890625],
    [5.833939098607025,  170.85247802734372],
    [5.861586030831371,  175.64184570312503],
    [5.866335876872544,  176.47808837890625],
    [5.869449614294116,  177.02844238281247],
    [5.879497954012966,  178.81622314453122],
    [5.893213844044451,  181.28570556640625],
    [5.944588630523773,  190.84246826171866],
    [5.947493525920713,  191.39764404296875],
    [5.962341215900494,  194.26062011718753],
    [5.9656082276276,    194.89630126953122],
    [5.9749284849312865, 196.7212524414062],
    [5.975165500176202,  196.76788330078128],
    [5.981706804024238,  198.05920410156241],
    [5.991310884439669,  199.9705200195312],
    [6.004868209578554,  202.70001220703122],
    [6.0159406892865155, 204.95684814453116],
    [6.025476453825986,  206.92059326171866],
    [6.047172064627678,  211.45886230468741],
    [6.0479418642231595, 211.62170410156256],
    [6.050479329955437,  212.1593627929687],
    [6.086466833749719,  219.93341064453125],
    [6.101870903204913,  223.3474731445312],
    [6.1249427443985525, 228.56036376953128],
    [6.129204755426344,  229.53656005859375],
    [6.136241935513706,  231.1575317382813],
    [6.153688953514383,  235.22589111328134],
    [6.1619244798633215, 237.17108154296884],
    [6.165012268502458,  237.90454101562506],
    [6.187036941752032,  243.202392578125],
    [6.191527178125454,  244.29687500000003],
    [6.196001570568187,  245.3923950195312],
    [6.197677082130341,  245.80389404296875],
    [6.2133379061260285, 249.68365478515622],
    [6.223871642756905,  252.3276367187501],
    [6.228398760115369,  253.47253417968756],
    [6.269692237869835,  264.1583251953126],
    [6.276143287577458,  265.8679199218749],
    [6.305884283737176,  273.89379882812494],
    [6.306492908028797,  274.0605468750001],
    [6.3065018163217115, 274.06298828125006],
    [6.31104892482331,   275.3120117187501],
    [6.3322712125431915, 281.2171630859374],
    [6.343324976847916,  284.34289550781244],
    [6.345081883725142,  284.84289550781256],
    [6.353683609448096,  287.30358886718756],
    [6.366114643735997,  290.8973388671876],
    [6.373476431987165,  293.0467529296875],
    [6.3734826803404045, 293.04858398437494],
    [6.3862671775996915, 296.819091796875],
    [6.389086936901673,  297.6572265625],
    [6.424562459508495,  308.4062500000001],
    [6.4506171773701535, 316.5472412109376],
    [6.462221144761522,  320.24182128906256],
    [6.468740575092418,  322.33642578125],
    [6.472375224718483,  323.5101318359374],
    [6.485834999462654,  327.8939208984375],
    [6.486412623146554,  328.08337402343744],
    [6.486812521370483,  328.214599609375],
    [6.498698952535687,  332.1391601562501],
    [6.521175044233963,  339.6888427734376],
    [6.522595306993373,  340.171630859375],
    [6.522766822935215,  340.2299804687499],
    [6.52502285413445,   340.99841308593744],
    [6.5445411825986985, 347.7194824218749],
    [6.5451209675856825, 347.9211425781249],
    [6.55061885367159,   349.8392333984375],
    [6.560126626713879,  353.1812744140626],
    [6.560510895819139,  353.31701660156244],
    [6.565186990039135,  354.97302246093756],
    [6.567067660815945,  355.64123535156233],
    [6.588081320423386,  363.19360351562517],
    [6.5896131163651415, 363.7503662109376],
    [6.597598047275183,  366.66650390624983],
    [6.608222493065004,  370.5828857421874],
    [6.611563301604297,  371.822998046875],
    [6.622421213257873,  375.88220214843756],
    [6.625684248051368,  377.11071777343744],
    [6.626950731244344,  377.58862304687483],
    [6.630267034079059,  378.8428955078124],
    [6.630977920761718,  379.11230468749994],
    [6.636217452968849,  381.10388183593756],
    [6.638857149899159,  382.1112060546874],
    [6.641161660644278,  382.9927978515625],
    [6.652047018118426,  387.1845703124999],
    [6.658445560711748,  389.66992187499994],
    [6.658790721334144,  389.8044433593749],
    [6.675345858154136,  396.3114013671875],
    [6.677094789236718,  397.00512695312494],
    [6.6775691166680895, 397.1934814453124],
    [6.679106750673113,  397.80468749999994],
    [6.681712590609845,  398.84265136718744],
    [6.682523938576487,  399.16638183593744],
    [6.68274532345516,   399.2547607421874],
    [6.685459416477178,  400.3398437499999],
    [6.694456277839498,  403.9578857421875],
    [6.6952522228540765, 404.27954101562517],
    [6.6971746771142415, 405.05749511718744],
    [6.702764738337774,  407.328125],
    [6.7033022311799595, 407.54711914062506],
    [6.710763953621196,  410.59948730468756],
    [6.711256159037373,  410.8016357421876],
    [6.712054288828399,  411.12963867187494],
    [6.713939407502346,  411.9053955078124],
    [6.722828986708716,  415.5833740234374],
    [6.727835453862132,  417.66918945312506],
    [6.734632628835641,  420.51782226562506],
    [6.743787740494532,  424.38537597656233],
    [6.744565219553757,  424.71545410156244],
    [6.7715720212680655, 436.3419189453125],
    [6.776510146304201,  438.50195312500017],
    [6.778412462065226,  439.33691406250017],
    [6.79247934060035,   445.5606689453126],
    [6.809016260337229,  452.9901123046875],
    [6.810747231716348,  453.7749023437499],
    [6.817335895109251,  456.7745361328125],
    [6.819910421197311,  457.9520263671875],
    [6.821497844004013,  458.6795654296874],
    [6.8254946428721475, 460.51647949218767],
    [6.828433164406687,  461.87170410156256],
    [6.834543470287694,  464.70251464843756],
    [6.839609377592375,  467.06262207031267],
    [6.839627933844213,  467.0712890625001],
    [6.846084943645239,  470.09692382812494],
    [6.856799276049143,  475.16076660156233],
    [6.861822721577315,  477.5537109374998],
    [6.864066049482581,  478.62622070312517],
    [6.864420497333681,  478.79589843750017],
    [6.866278653973069,  479.68640136718733],
    [6.866487814627139,  479.7867431640625],
    [6.8667493311188395, 479.9122314453126],
    [6.872084270243208,  482.4793701171875],
    [6.872164723177875,  482.5181884765627],
    [6.874982560453874,  483.87976074218767],
    [6.876191234145179,  484.46496582031233],
    [6.877966548833207,  485.3258056640624],
    [6.888721726428236,  490.57373046875006],
    [6.89515989558997,   493.74230957031244],
    [6.896232568812718,  494.2722167968751],
    [6.900624415355815,  496.44775390624983],
    [6.901816998553275,  497.0401611328125],
    [6.9042162822876465, 498.23413085937483],
    [7.193052598670793,  665.0791015625001],
    [7.758155143419732,  1170.29150390625],
    [8.323023697145112,  2058.795898437501],
    [9.36298131161099,   5824.533203125004],
    [9.810748008110926,  9114.308593750004],
    [11.047341056314202, 31388.40624999998],
    [11.584925435512535, 53732.765624999956],
    [12.366958539207397, 117455.0937500001],
    [13.107089828327874, 246210.62499999983],
    [13.84248373881162,  513670.1250000003],
    [14.27084873575108,  788353.2499999999],
    [15.060339852215408, 1736170.999999999],
    [15.835873313657556, 3770530.0000000005],
    [15.977474039173265, 4344089.999999998],
    [16.943967899150145, 11419360.000000006],
    [17.943394339560967, 31023239.99999997],
    [18.214035936745432, 40665424.00000006],
    [19.374560581709215, 129788063.99999991],
    [19.927723623778547, 225668224.00000027],
    [20.619308638400597, 450631936.0000006],
    [21.129986093026698, 750941952.0000008],
    [22.05159150215413,  1887358976.0000033],
    [22.734966842639743, 3738011648.0000052],
    [23.42954051928097,  7486695423.99999],
    [23.955498471391667, 12668080127.99998],
    [24.591055724582848, 23918272512],
    [25.305424481799395, 48862560256.00005],
    [26.150535181949436, 113763549183.99998],
    [26.499894449532565, 161334755328.00018],
    [27.19075733422632,  321933279232.0004],
    [27.989721778208146, 715734122496],
    [28.953212876533797, 1875817529343.9976],
];

for (var [x, y] of cosh_data)
    assertNear(Math.cosh(x), y, sloppy_tolerance);

for (var i = -20; i < 20; i++)
    assertNear(Math.cosh(i), (Math.exp(i) + Math.exp(-i)) / 2, sloppy_tolerance);

reportCompare(0, 0, "ok");
