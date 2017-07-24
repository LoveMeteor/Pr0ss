import _  from 'underscore'
import _s from 'underscore.string'

DOMUtils = {
    Mutating: {
        replaceFirstListItem: (li, replaceWith) => {
            let list = DOMUtils.closest(li, "ul, ol")

            let text
            if (replaceWith.length == 0) {
                replaceWith = replaceWith.replace(/\s/g, "&nbsp;")
                text = document.createElement("div")
                text.innerHTML = "<br>"
            } else {
                replaceWith = replaceWith.replace(/\s/g, "&nbsp;")
                text = document.createElement("span")
                text.innerHTML = "#{replaceWith}"
            }

            if (list.querySelectorAll('li').length <= 1) {
                // Delete the whole list and replace with text
                list.parentNode.replaceChild(text, list)
            } else {
                // Delete the list item and prepend the text before the rest of the list
                li.parentNode.removeChild(li)
                list.parentNode.insertBefore(text, list)
            }
            let child = text.childNodes[0] ? text : null
            let index = Math.max(replaceWith.length - 1, 0)
            let selection = document.getSelection()
            selection.setBaseAndExtent(child, index, child, index)
        },

        removeEmptyNodes: (node) => {
            [...node.childNodes].forEach((child) => {
                if (child.textContent == '') {
                    node.removeChild(child)
                } else {
                    DOMUtils.Mutating.removeEmptyNodes(child)
                }
            })
        },

        /* Given a bunch of elements, it will go through and find all elements
         # that are adjacent to that one of the same type. For each set of
         # adjacent elements, it will put all children of those elements into
         # the first one and delete the remaining elements.*/
        collapseAdjacentElements: (els = []) => {
            if (els.length == 0) return
            els = [...els]

            let seenEls = []
            let toMerge = []

            for (let el of els) {
                if (seenEls.indexOf(el) > -1) continue
                let adjacent = DOMUtils.collectAdjacent(el)
                seenEls = seenEls.concat(adjacent)
                if (adjacent.length <= 1) continue
                toMerge.push(adjacent)
            }

            let anchors = []
            for (let mergeSet of toMerge) {
                let anchor = mergeSet[0]
                let remaining = mergeSet.slice(1)
                for (let el of remaining) {
                    while (el.childNodes.length > 0)
                        anchor.appendChild(el.childNodes[0])
                }
                DOMUtils.Mutating.removeElements(remaining)
                anchors.push(anchor)
            }

            return anchors
        },

        removeElements: (elements = []) => {
            for (let el of elements) {
                try {
                    if (el.parentNode) el.parentNode.removeChild(el)
                } catch (err) {
                    // This can happen if we've already removed ourselves from the node or it no longer exists
                    continue
                }
            }
            return elements
        },

        applyTextInRange: (range, selection, newText) => {
            range.deleteContents()
            let node = document.createTextNode(newText)
            range.insertNode(node)
            range.selectNode(node)
            selection.removeAllRanges()
            selection.addRange(range)
        },

        getRangeAtAndSelectWord: (selection, index) => {
            range = selection.getRangeAt(index)

            // On Windows, right-clicking a word does not select it at the OS-level.
            if (range.collapsed) {
                DOMUtils.Mutating.selectWordContainingRange(range)
                range = selection.getRangeAt(index)
            }
            return range
        },

        // This method finds the bounding points of the word that the range is currently within and selects that word.
        selectWordContainingRange: (range) => {
            let selection = document.getSelection()
            let node = selection.focusNode
            let text = node.textContent
            let wordStart = _s.reverse(text.substring(0, selection.focusOffset)).search(/\s/)
            if (wordStart == -1)
                wordStart = 0
            else
                wordStart = selection.focusOffset - wordStart
            wordEnd = text.substring(selection.focusOffset).search(/\s/)
            if (wordEnd == -1)
                wordEnd = text.length
            else
                wordEnd += selection.focusOffset

            selection.removeAllRanges()
            range = new Range()
            range.setStart(node, wordStart)
            range.setEnd(node, wordEnd)
            selection.addRange(range)
        },

        moveSelectionToIndexInAnchorNode: (selection, index) => {
            if (!selection.isCollapsed) return
            let node = selection.anchorNode
            selection.setBaseAndExtent(node, index, node, index)
        },

        moveSelectionToEnd: (selection) => {
            if (!selection.isCollapsed) return
            let node = DOMUtils.findLastTextNode(selection.anchorNode)
            let index = node.length
            selection.setBaseAndExtent(node, index, node, index)
        }
    },

    escapeHTMLCharacters: (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }
        return text.replace(/[&<>"']/g, (m) => map[m])
    },
    /* This checks for the `offsetParent` to be null. This will work for
     hidden elements, but not if they are in a `position:fixed` container.

     It is less thorough then Utils.nodeIsVisible, but is ~16x faster!!
     http://jsperf.com/check-hidden
     http://stackoverflow.com/a/21696585/793472
     nodeIsLikelyVisible: (node) -> node.offsetParent isnt null

     Finds all of the non blank node in a {Document} object or HTML string.

     - `elementOrHTML` a dom element or an HTML string. If passed a
     string, it will use `DOMParser` to convert it into a DOM object.

     "Non blank" is defined as any node whose `textContent` returns a
     whitespace string.

     It will also reject nodes we see are invisible due to basic CSS
     properties.

     Returns an array of DOM Nodes*/
    nodesWithContent: (elementOrHTML) => {
        let nodes = []
        let allNodes

        if (_.isString(elementOrHTML)) {
            let domParser = new DOMParser()
            let doc = domParser.parseFromString(elementOrHTML, "text/html")
            allNodes = doc.body.childNodes
        } else if (elementOrHTML && elementOrHTML.childNodes) {
            allNodes = elementOrHTML.childNodes
        } else {
            return nodes
        }

        // We need to check `childNodes` instead of `children` to look for
        // plain Text nodes.
        for (let i = allNodes.length - 1; i >= 0; i--) {
            let node = allNodes[i]
            if (node.nodeName == "IMG")
                nodes.unshift(node)

            /* It's important to use `textContent` and NOT `innerText`.
             `innerText` causes a full reflow on every call because it
             calcaultes CSS styles to determine if the text is truly visible or
             not. This utility method must NOT cause a reflow. We instead will
             check for basic cases ourselves.*/
            if ((node.textContent || "").trim().length == 0) {
                continue
            }

            if (node.style &&
                (node.style.opacity === 0 ||
                    node.style.opacity === "0" ||
                    node.style.visibility === "hidden" ||
                    node.style.display === "none"
                )
            ) {
                continue
            }

            nodes.unshift(node)
        }

        // No nodes with content found!
        return nodes
    },
    /* https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
     Only Elements (not Text nodes) have the `closest` method*/
    closest: (node, selector) => {
        if (node instanceof HTMLElement)
            return node.closest(selector)
        else if (node && node.parentNode)
            return DOMUtils.closest(node.parentNode, selector)
        else return null
    },
    /* Returns an array of all immediately adjacent nodes of a particular
     nodeName relative to the root. Includes the root if it has the correct
     nodeName.

     nodName is optional. if left blank it'll be the nodeName of the root*/
    collectAdjacent: (root, nodeName) => {
        nodeName = nodeName ? nodeName : root.nodeName
        let adjacent = []

        let node = root
        while (node.nextSibling && node.nextSibling.nodeName == nodeName) {
            adjacent.push(node.nextSibling)
            node = node.nextSibling
        }

        if (root.nodeName == nodeName)
            adjacent.unshift(root)

        node = root
        while (node.previousSibling && node.previousSibling.nodeName == nodeName) {
            adjacent.unshift(node.previousSibling)
            node = node.previousSibling
        }

        return adjacent
    },

    findLastTextNode: (node) => {
        if (!node) return null
        if (node.nodeType == Node.TEXT_NODE) return node
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            let childNode = node.childNodes[i]

            if (childNode.nodeType == Node.TEXT_NODE)
                return childNode
            else if (childNode.nodeType == Node.ELEMENT_NODE)
                return DOMUtils.findLastTextNode(childNode)
            else continue
        }
        return null
    }

}
module.exports = DOMUtils
