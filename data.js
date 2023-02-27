

const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment')

const URL_HOME = 'https://www.mytischtennis.de/clicktt/HeTTV/22-23/verein/33058/TTC-Offheim-1949/mannschaften/'
const MYTT_PREFIX = 'https://www.mytischtennis.de';

function getDatum(row){
   return `#playingPlanDesktop > tbody > tr:nth-child(${row}) > td:nth-child(1) > span`
}

function getZeit(row){
    return`#playingPlanDesktop > tbody > tr:nth-child(${row}) > td:nth-child(2)`
    
}

function getHeim(row){
    return`#playingPlanDesktop > tbody > tr:nth-child(${row}) > td:nth-child(4) > a`
}
function getGast(row){
    return`#playingPlanDesktop > tbody > tr:nth-child(${row}) > td:nth-child(5) > a`
}

function getErg(row){
    return`#playingPlanDesktop > tbody > tr:nth-child(${row}) > td:nth-child(8) > a`
}

function getisPlayed(row){
    return `#playingPlanDesktop > tbody > tr:nth-child(${row}) > td:nth-child(9) > i`
}

function createDate(time, datum)
{
const date = moment(datum.substring(3) + " "+ time, "DD.MM.YY HH:mm").utc().toDate();
return date;
}

async function getData(t)
{
let values = [];
const info = await getInfos();

if(!info || info.length<=0)
    return values;

 return Promise.all(info.flatMap(async (element) => {
    if(t && t.length > 0 && !t.includes(element.teamName))
        return [];
    const {data} = await axios.get(element.teamLink) 
        let values = [];
        const $ = cheerio.load(data)        
        const rowCount = $('#playingPlanDesktop > tbody > tr').length
        for (let i = 1; i <= rowCount; i++) {
            const teamName = element.teamName;
            const datum = $(getDatum(i)).text().replace(/\s/g, "");
            const zeit = $(getZeit(i)).text().replace(/\s/g, "");
            const time =zeit.includes("v") ? zeit.slice(0, zeit.indexOf("v")): zeit;
            const date = createDate(time, datum);
            const heim = $(getHeim(i)).text().replace(/\s/g, " ");
            const heimLink = MYTT_PREFIX+ $(getHeim(i)).attr('href').replace(" ","%20");

            const heimSpiel  = heim.includes("Offheim") ? true : false;

            const gast = $(getGast(i)).text().replace(/\s/g, " ");
            const gastLink = MYTT_PREFIX + $(getGast(i)).attr('href').replace(" ","%20");

            const erg= $(getErg(i)).text().replace(/\s/g, "")
            const endstand = erg.length > 0 ? erg : "Kein Erg";
            const hasBeenPlayed = $(getisPlayed(i)).length > 0 ? true:false;
            values.push( {
                date,
                teamName,
                heim,
                heimLink,
                gast,
                gastLink,
                endstand,
                hasBeenPlayed,
                heimSpiel
            })
          }
          return values;
        }));
}

async function getInfos()
{
let values = [];
const {data} = await axios.get(URL_HOME) 

        const $ = cheerio.load(data)        
        const rowCount = $('#theMainColumnFromLayout > div:nth-child(1) > div.panel-body > table > tbody > tr').length
        for (let i = 1; i <= rowCount; i++) {

            const teamName =$(`#theMainColumnFromLayout > div:nth-child(1) > div.panel-body > table > tbody > tr:nth-child(${i}) > td:nth-child(1) > a`).text().replace(" ", "");
            const teamLink =  MYTT_PREFIX + $(`#theMainColumnFromLayout > div:nth-child(1) > div.panel-body > table > tbody > tr:nth-child(${i}) > td:nth-child(1) > a`).attr('href').replace(" ","%20");
            const league =$(`#theMainColumnFromLayout > div:nth-child(1) > div.panel-body > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > a`).text();

            if(!league.includes("Pokal"))
            {
            values.push({
                teamName,
                league,
                teamLink
            })
        }
          }
          return values;
}

exports.data= getData;
exports.infos= getInfos;
