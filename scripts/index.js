
let requestURL = '/scrape/data/NeurIPS/NeurIPS_2015.json';
/*function getUrl (conf, year) {
    let requestURL = '/scrape/data/' + conf + '/' + conf + '_' + year + '.json';
    loadJson(requestURL);
}*/

//function loadJson (requestURL) {
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        const mypapers = request.response;
        populateMain(mypapers);
    
    }
//}

function populateMain(jsonObj) {

    for (let key in jsonObj) { 
        if (jsonObj.hasOwnProperty(key)) 
        { 
            value = jsonObj[key]; 
             
        }
        const card = document.createElement('div');
        card.setAttribute('class', 'card');
    
        const title = document.createElement('p');
        title.setAttribute('class', 'title');
        title.textContent = value.title;
    
        const author = document.createElement('p');
        author.setAttribute('class', 'author');
        for(let j=0; j < value.authors.length; j++){
            if ( j == value.authors.length - 1){
                author.textContent += value.authors[j] + '.'; 
            }
            else {
            author.textContent += value.authors[j] + ', ';
            }
        }
    
        const imgContainer = document.createElement('div');
        imgContainer.setAttribute('class', 'img-container');
    
        //Make card
        card.appendChild(title);
        card.appendChild(author);
        card.appendChild(imgContainer);
    
        document.querySelector('#render2').appendChild(card);

    } 
    
}

