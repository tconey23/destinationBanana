import PagesContainer from '../PagesContainer/PagesContainer';
import LinkBox from '../LinkBox/LinkBox'
import Toolbar from '../Toolbar/Toolbar'
import Win from '../Win/Win'
import { fetchPage, fetchHTML } from '../../ApiCalls';
import { useEffect, useState, useRef } from 'react'
import parse from 'html-react-parser';
import { gsap } from 'gsap';
import Draggable from 'gsap/Draggable';
import { StyledHomepage } from './HomePage.styled'
import { useNavigate } from 'react-router-dom'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import { useGlobalProps } from '../..';

gsap.registerPlugin(Draggable, ScrollTrigger);

function HomePage() {
  
  const [pages, setPages] = useState([])
  const [linkList, setLinkList] = useState([])
  const [nextId, setNextId] = useState(1)
  const [targetTitle, setTargetTitle] = useState('banana')
  const [win, setWin] = useState(false)
  const [backClicks, setBackClicks] = useState(0)
  const navigate = useNavigate()
  gsap.config({ trialWarn: false })

  Draggable.create(".draggable-container", {
    type: "x",
    edgeResistance: 0.65,
    bounds: { minX: 0}
  })


  const {
    startTitle,
    setStartTitle
  } = useGlobalProps();


  useEffect(() => {
    fetchWikiData()
  }, [startTitle])

  const fetchWikiData = async() => {
    let endpointAPI
    if(!endpointAPI && !startTitle){
      fetch('https://en.wikipedia.org/api/rest_v1/page/random/title').then(rando => {
        return rando.json()
      }).then(data => {
        endpointAPI = data.items[0].title.replaceAll('_', ' ').toString()
        updatePages(endpointAPI)
        let tl = gsap.timeline()
        tl.to('#links-container', { duration: 1, ease: 'bounce', left: '0' });
      }).catch(error => handleError(error))
    } else {
        const formatTitle = startTitle.replaceAll('_', ' ').toString()
        let tl = gsap.timeline()
        tl.to('#links-container', { duration: 1, ease: 'bounce', left: '0' });
      updatePages(formatTitle)
    }

  }
  
  function handleError(error) {
    navigate('/error')
  }

  function handleBrokenLink(){
    let tl = gsap.timeline()
    const monkeyContainer = document.createElement('div')
    const monkeyBro = document.createElement('img')
    const badLink = document.createElement('div')
    const linkMsg = document.createElement('h3') 

    monkeyContainer.id = 'monkey-container'
    linkMsg.innerHTML = `Whoops! It looks like that banana won\'t banana <br/> Pick a new link`
    badLink.id = 'bad-link'
    monkeyBro.src = '/assets/confused_monkey.svg'
    monkeyBro.id = "confused-monkey"

    const homePage = document.querySelector('.background-container')
    homePage.appendChild(monkeyContainer)
    monkeyContainer.appendChild(monkeyBro)
    monkeyContainer.appendChild(badLink)
    badLink.appendChild(linkMsg)

    tl.to(monkeyContainer, {
      transform: 'translate(637px, -895px)',
      duration: 0.5,
      ease: 'bounce',
    })
    
    tl.to(monkeyContainer, {
      transform: 'translate(-1000px, -895px)',
      duration: 0.5,
      ease: 'bounce',
      onComplete: () => {
        homePage.removeChild(monkeyContainer)

      }
    }, '+=2')
  }

  function updatePages(endpointText) {
    console.log(endpointText)
    createLinkList(endpointText)

    let htmlFilter

    const parser = new DOMParser()
    fetchHTML(endpointText).then(html => {
      if(!html){
        handleBrokenLink()
        focusPage(0)
        return
      }

      htmlFilter = parser.parseFromString(html, 'text/html').querySelector('body > section').outerHTML

      const parsedHTML = parse(htmlFilter)
      const newPage = {
        id: nextId,
        stringForDOM: parsedHTML,
        isCurrent: true,
        isDisplayed: true,
        title: endpointText
      }

      setNextId(prev => prev += 1)
      setPages((prev) => {
        const updatedPages = prev.map((page) => {
          page.isCurrent = false

          return page
        })

        return [...updatedPages, newPage]
      })
    }).catch(error => handleError(error))
  }
  
  function cleanupHTML() {
    document.querySelectorAll('img').forEach((img) => {
      if (img.src.includes('Red_pog')) {
        img.remove()
      }
    })
  }

  function createLinkList(endpointText) {
    let charactersToRemove = ['_', '-', '%', ":", 'Help', 'Template', 'Portal']
    let filteredWikiLinks
    fetchPage(endpointText).then(linksArray => {
      filteredWikiLinks = linksArray.filter(link => {
        return !charactersToRemove.some(character => link.title.includes(character));
      })

      const randomizedList = filteredWikiLinks.sort(() => Math.random() - 0.5);
      // const randomizedList = filteredWikiLinks.sort();

      const bananaIndex = randomizedList.forEach((link, i) => {
        i++
        if(link.title.toLowerCase() === 'banana'){
          const bananaLink = randomizedList.splice(i-1, 1)
          randomizedList.unshift(bananaLink[0])
        }
      })
      
      setLinkList(randomizedList)
   
    })
  }

  function checkForWin(text) {
    if (text.toLowerCase() === targetTitle.toLowerCase()) {
      handleWin()
    }
  }

  function handleWin() {
    setWin(true)
  }

  function animateWin(ref) {
    let dots = [],
      bg = document.getElementById('main-content'),
      i, dot;
    for (i = 0; i < 200; i++) {
      dot = document.createElement("div");
      dot.setAttribute("class", "dot");
      bg.appendChild(dot);
      dot.textContent = "🍌"
      dots.push(dot)
    }
    gsap.set(dots, {
      scale: "random(2, 10)",
      x: -2500,
      y: 800,
      rotate: "random(0,180)",
      transform: 'translate(50%, 50%)'
    })
  
    let tl = gsap.timeline({ repeat: 100})
    tl.to(ref.current, 0.1, { alpha: 1, filter: 'invert(1)', delay: 1 }, 0).to(ref.current, 0.1, { alpha: 1, filter: 'invert(0)', delay: 0 })
  
    // tl.to(dots, {
    //   duration: 0.5,
    //   delay: "0"
    // })

    let tl2 = gsap.timeline({onComplete: removeDots})
    tl2.to(dots, {
      duration: 5, 
      y: '+=5000', 
      ease: 'easeInOutQuad', 
      delay: "0.5",
      zIndex: '100',
    })

  
    function removeDots() {
     document.querySelectorAll('.dot').forEach((dot) => dot.remove())
    }
  }
  

  function focusPage(id) {
    setBackClicks((prev) => {
      const newBacks = prev + 1

      return newBacks
    })

    let selectedPage;

    if (!id) {
      const currentPage = pages.find(page => page.isCurrent)
      const previousPage = pages.reduce((prevPage, page) => {
        if (page.id < currentPage.id && page.isDisplayed) {
          prevPage = page
        }

        return prevPage
      }, {})
      
      selectedPage = previousPage
    } else {
      selectedPage = pages.find((page) => {
        return page.id === id
      })
    }

    const updatedPages = pages.map((page) => {
      if (page.id > selectedPage.id) {
        page.isDisplayed = false
      }
      page.isCurrent = false
      if (page.id === selectedPage.id) {
        page.isCurrent = true
      }

      return page;
    })
    cleanupHTML()
    createLinkList(selectedPage.title)
    setPages(updatedPages)
  }

  return (
    <StyledHomepage >
      {win && <Win pages={pages} animateWin={animateWin} />}
      <Toolbar setStartTitle={setStartTitle} startTitle={startTitle} pages={pages} focusPage={focusPage} backClicks={backClicks} />
      <div className="background-container">
        <LinkBox id="links-container" linkList={linkList} checkForWin={checkForWin} updatePages={updatePages} pages={pages} />
        <div className='draggable-container'>
          <main id='main-content'>
            <PagesContainer id="page-container" pages={pages} focusPage={focusPage} />
          </main>
        </div>
      </div>
    </StyledHomepage>
  )

}

export { HomePage }