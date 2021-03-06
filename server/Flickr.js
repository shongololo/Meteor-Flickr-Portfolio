//// FLICKR API LIBRARY ////
// Note that you need the Meteor HTTP package for the calls

// Retrieves userID
FlickrUserID = function(apiKey,userName,callback){
	Meteor.http.call("GET","http://api.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key="+apiKey+"&username="+userName+"&format=json&nojsoncallback=1",function (error, result) {
		if (result.statusCode === 200) {
			var idResult = JSON.parse(result.content);
// use global variable to return to code in other files
			userID = idResult.user.nsid;
			}
		if (callback && typeof(callback) === "function") {  
			callback();
		}
	});
};

// Retrieves user's sets
FlickrSetList = function(apiKey,userID,flickrDB,flickrDBKey,callback){
	Meteor.http.call("GET","http://api.flickr.com/services/rest/?method=flickr.photosets.getList&api_key="+apiKey+"&user_id="+userID+"&format=json&nojsoncallback=1", {},function (error, result) {
		if (result.statusCode === 200) {
			var setResult = JSON.parse(result.content);
			var setCount = setResult.photosets.total;
			for (var i = 0; i < setCount; i++) {
				var info = setResult.photosets.photoset[i];
				var flickrSetID = info.id;
				var num = i;
				flickrDB.update(
					{"id":flickrSetID},//query
					{$set:{"setNum":num, "key":flickrDBKey,"data":info}},//update
					{upsert:true}//upsert
				);
			}
		}
		if (callback && typeof(callback) === "function") {  
			callback();
		}
	});
};

// Retrieves set's photos                
FlickrSetPhotos = function(apiKey,flickrSetID,flickrDBKey,callback){
	console.log("Photos retrieved from "+flickrSetID);
	Meteor.http.call("GET","http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key="+apiKey+"&photoset_id="+flickrSetID+"&extras=date_taken,tags,machine_tags,path_alias,url_sq,url_t,url_s,url_m,url_o&format=json&nojsoncallback=1", function(error,result){
		if (result.statusCode === 200) {
			var photos = JSON.parse(result.content);
			var photoInfo = photos.photoset;
			flickrDB.update(
				{"id":flickrSetID},//query
				{$set:{"photos":photoInfo}},//update
				{upsert:true}//upsert
			);
		}
		if (callback && typeof(callback) === "function") {  
			callback();
		}
	});
};