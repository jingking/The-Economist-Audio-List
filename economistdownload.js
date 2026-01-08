/*
Created by Jing on Apr 19, 2021
Last updated on Apr 18, 2025
Retrieve the audio archive from The Economist's CDN server.
*/

const cdnurl = "https://audiocdn.economist.com/sites/default/files/AudioArchive/";
const cdnurl_2025 = "https://economist.com/mobile-assets/{0}-audio.zip"
const jsonurl_2025 = "https://jingking.github.io/The-Economist-Audio-List/searchEditions{0}.json";

var jsonUrl = "";

var urlstr_2012 = cdnurl + "{0}/{1}/{1}_TheEconomist_Full_Edition.{2}";
var urlstr_2019 = cdnurl + "{0}/{1}/Issue_{2}_{1}_The_Economist_Full_Edition.{3}";
var urlstr = cdnurl + "{0}/{1}/Issue_{2}_{1}_The_Economist_Full_edition.{3}";
//file extension
let extension = {
  download: "zip", 
  online: "m4a"
};
const InitiaYear = 2021;
const InitialDate = new Date(Date.UTC(InitiaYear,0,2));
const InitiaIssue = 9226;
//cover image config 
var imgurlconfig = [
{
	date:new Date(Date.UTC(2000,0,1)),//2000-01-01,//
	urlconfig:{
		imgurl: "https://www.economist.com/img/b/400/526/90/sites/default/files/{0}issuecov{1}.jpg",
		file:['US400','UK400']
	}
},
{
	date:new Date(Date.UTC(2010,8,5)),//2010-09-05,//>= 2010-09-11
	urlconfig:{
		imgurl: "https://www.economist.com/img/b/400/526/90/sites/default/files/{0}_{1}.jpg",
		file:['cna400','cuk400','cuk400hires','cna400hires','CNA400']
	}
},
{
	date:new Date(Date.UTC(2012,8,16)),//2012-09-16,//>= 2012-09-22
	urlconfig:{
		imgurl: "https://www.economist.com/img/b/400/526/90/sites/default/files/print-covers/{0}_{1}.jpg",
		file:['cna1280','cuk1280','de_us','de_uk','cna400','cuk400','cna400hires', 'cna1248', 'cna1280_0']
	}
},
{
	date:new Date(Date.UTC(2022,4,15)),//2022-05-15,//>= 2022-05-21
	urlconfig:{
		imgurl: "https://www.economist.com/img/b/400/526/90/media-assets/image/{0}_{1}.jpg",
		file:['DE_US','DE_EU']
	}
}
];
//content ref 
var imghref = "https://www.economist.com/printedition/{0}";


let MyEdition = {
	Date: "", //Weekly Edition Date
	Issue: "", //Weekly Edition Issue
	Title: "", //Title text
	Image: "",//Cover image HTML 
	AudioURL: "", //Audio URL
	DownloadURL: "",//Mp3 zip file URL
	ContentIndex: "" //content index   
};

function getEditionByDate(){    
	var year = document.getElementById("year").value;
	var month = document.getElementById("month").value;
	var day = document.getElementById("day").selectedIndex+1;

	var d = getEditionDate(year,month,day);

	if (d != null){
		this.document.getElementById("edition_content").style.display = 'block';
		getEdition(d)
			.then(function(MyEdition){
				if (MyEdition != null){
					this.document.getElementById("edition_title").innerHTML = MyEdition.Title;
					this.document.getElementById("edition_img").innerHTML = MyEdition.Image;
					this.document.getElementById("edition_url").innerHTML = MyEdition.Title.link(MyEdition.DownloadURL);	
					if (MyEdition.AudioURL != "")
					{
						this.document.getElementById("edition_audiosource").src = MyEdition.AudioURL;
						audio = this.document.getElementById("edition_audio");
						audio.preload = "metadata";
						audio.load();
					}
					else{
						this.document.getElementById("edition_audio").style.display = 'none';
					}
				}
		})
	}
	else
		this.document.getElementById("edition_title").innerHTML = "Error!";
}

//input any date, return valid weekly edition date
function getEditionDate(year,month,day){
  var d = new Date(Date.UTC(year, month, day));
  dayofweek = d.getUTCDay();
  //console.log(dayofweek);
  if (dayofweek<6)
	d = new Date(Date.UTC(year, month, day-1-dayofweek));
  //special case 
  if (d.getUTCFullYear() ==2011 && d.getUTCMonth() == 11 && d.getUTCDate() >=24)
    return new Date(Date.UTC(2011, 11, 31));
  //2022 summer double issue
  if (d.getUTCFullYear() ==2022 && d.getUTCMonth() == 7 && d.getUTCDate() < 13)
	  return getEditionDate(year, month, day-7);
  //2023 summer double issue
  if (d.getUTCFullYear() ==2023 && d.getUTCMonth() == 7 && d.getUTCDate() < 12)
	  return getEditionDate(year, month, day-7);
  
  if (d.getUTCMonth() == 11 && d.getUTCDate() >24 ){
    return getEditionDate(year, month, day-7);
   } //Christmas
else
  return d;
}

//assemble myedition
async function getEdition(d){
	if (d != null){
		let edition = new Object();
		edition.Date = d.toISOString().slice(0, 10);
		edition.Issue = getEditionIssue(d);
		edition.Title = getEditionTitle(d);
		edition.Image = getEditionImg(d);
        const URLs = await getEditionURL(d);
        edition.AudioURL = URLs.audio;
        edition.DownloadURL = URLs.download;
        return edition;
	}
	else 
		return null;
 }

function getEditionTitle(d){
//need to retrieve title from official website
//use Date as a placeholder for now.
	return "Weekly Edition "+d.toISOString().slice(0, 10);
}

//get cover image and assemble HTML output
function getEditionImg(d){
	var imageresults = document.createElement("a");
	var datestr=d.toISOString().slice(0, 10);
	  
	var i=0;
	while((i < imgurlconfig.length) && (d > imgurlconfig[i].date)){
		i++;
	}
	var url = imgurlconfig[i-1].urlconfig.imgurl;
	var files = imgurlconfig[i-1].urlconfig.file;  
	 
	for(i=0; i < files.length; i++){
		var img = document.createElement('img'); 
		img.src=url.format(datestr.replace(/-/g, ''),files[i]);
		img.alt = "";
		imageresults.appendChild(img);	
	}
	  
	imageresults.href = imghref.format(datestr); 
	imageresults.target = "_blank";
	return imageresults.outerHTML; 
}

//input the weekly edition date, return date, m4a download url and zip file download url
async function getEditionURL(d){
	if (d.getUTCMonth() == 11 && d.getUTCDate() >24 && d.getUTCDate() <31) return null;
	datestr=d.toISOString().slice(0, 10).replace(/-/g, '');
	year=datestr.slice(0,4);
	var URLs = {
		date:"",
		audio:"",
		download:"" 
	}
	if (d > new Date(Date.UTC(2015,11,1))){// Old CDN URL stopped working since Dec 2024
		datestr = d.toISOString().split('T')[0];
		jsonUrl = jsonurl_2025.format(year);
		fetchIdByDate(datestr)
        const tagid = await fetchIdByDate(datestr);
        URLs.download = cdnurl_2025.format(tagid);
        return URLs;
	
	}else{
	
		issuestr=getEditionIssue(d);

		URLs.date = datestr;
		if (issuestr== 9136){
			URLs.audio = urlstr.format(year,datestr,issuestr,extension.online);
			URLs.download = urlstr_2019.format(year,datestr,issuestr,extension.download); 
		}else if (issuestr> 8796){
			URLs.audio = urlstr.format(year,datestr,issuestr,extension.online);
			URLs.download = urlstr.format(year,datestr,issuestr,extension.download);
		}else {
			URLs.audio = urlstr_2012.format(year,datestr,extension.online);
			URLs.download = urlstr_2012.format(year,datestr,extension.download);
		}
		return URLs;
	}

}

function getEditionIssue(d){
//2022 summer double issue - 9307
//2023 summer double issue - 9357
	var i = InitiaIssue;
	if (d > new Date(Date.UTC(2022,7,12)))
		i = i-1;
	if (d > new Date(Date.UTC(2023,7,11)))
		i = i-1;
	return Math.round(i - (year-InitiaYear) + (d-InitialDate)/(1000*60*60*24*7));
}

//get annual download list
async function getDownloadList(){
	this.document.getElementById("list").innerHTML = "";
	year=document.getElementById("year_d").value;
	if (year > 2015)
	{
		jsonUrl = jsonurl_2025.format(year);
		fetchIdList()
			.then(function(parts){
				for (var i = 0; i < parts.length; i++){
					var date = parts[i].node.issueDate;
					var id = parts[i].node.tegId;
					var datestr = date.split('T')[0];
					this.document.getElementById("list").innerHTML += `<a href="${cdnurl_2025.format(id)}" download="${datestr}.zip">${datestr}</a><br />`;
					 
				}
			})
	}
	else{
		var d = getEditionDate(year,0,7);
		var day = d.getUTCDate();
		
		for(var i = day; i < 360; i=i+7){
			if (year == 2011 && i==358){
				i=365;
			}
			getEditionURL(new Date(Date.UTC(year,0,i)))
				.then(function(URLs){
					if (URLs != null)
						this.document.getElementById("list").innerHTML += URLs.date.link(URLs.download) + "<br />";
			})
		}
	}
		
}


//string format function
String.prototype.format = function(){
   var content = this;
   for (var i=0; i < arguments.length; i++)
   {
        var replacement = '{' + i + '}';
        content = content.replaceAll(replacement, arguments[i]);  
   }
   return content;
};

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

//hide invalid images
document.addEventListener('error', function (event) {
	if (event.target.tagName.toLowerCase() !== 'img') return;
	event.target.style.display = 'none';
}, true);

async function fetchIdByDate(date) {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Loop through the JSON array
		const edges = data?.data?.searchEditions?.edges || [];
        const match = edges.find(edge => edge?.node?.issueDate?.startsWith(date));

        if (match) {
            const id = match.node.tegId;
			return id;
        } else {
            console.log("No matching ID found for selected issue.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

async function fetchIdList() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
		const parts = data?.data?.searchEditions?.edges || [];
        if (parts != null) {			
			return parts;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}


