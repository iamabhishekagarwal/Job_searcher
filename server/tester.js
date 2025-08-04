import parseHtmlLinkedin from "./src/helper/converter/parseLinkedInCards.js"
import parseHtmlNaukri from "./src/helper/converter/parseNaukriCards.js"
const paths1=[
  "../html/linkedIn/web-developer_64.html"
]
const paths2=[
  '../html/naukri/mobile-app-developer_p7_c18.html'
]

console.log(parseHtmlLinkedin(paths1))
console.log(parseHtmlNaukri(paths2))