const width = 800
const height = 800
const mainNodePosition = {x: Math.floor(width / 2), y: Math.floor(height / 20) }

let tree = null
let scale = 1.3
let sleepDelay = 250

// https://stackoverflow.com/a/39914235
const sleep = ms => new Promise(r => setTimeout(r, ms))

class Node {
  constructor(left, value, right) {
    this.value = value
    this.left = left
    this.right = right
    // Values that help us to draw on screen
    this.parent = null
    this.position = mainNodePosition
  }

  addLeft(value) {
    let position = this.calcPosition(true)
    let node = new Node(null, value, null)
    node.parent = this
    node.position = position
    this.left = node
  }

  addRight(value) {
    let position = this.calcPosition(false)
    let node = new Node(null, value, null)
    node.parent = this
    node.position = position
    this.right = node
  }

  calcPosition(isLeft) {
    let position = this.position
    let xDelta = 30

    if (position.x == Math.round(width / 2)) {
      xDelta = width / 4
    }

    return {
      x: isLeft ? position.x - xDelta : position.x + xDelta,
      y: position.y + 100
    }
  }
}

class Tree {
  constructor() {
    // This is better so we don't suffer with the lack of self-deleting
    // objects in JS when implementing the BST functions.
    this.root = null
  }

  async insert(value) {
    await this.#insert(this.root, value)
  }

  async find(value) {
    await this.#find(this.root, value)
  }

  async delete(value) {
    await this.#delete(this.root, value)
    console.log(tree)
  }

  async #insert(node, value) {
    if (this.root == null) {
      this.root = new Node(null, value, null)
      node = this.root
    }
    if (node.value == value) return;

    node.active = true
    await sleep(sleepDelay)
    node.active = false

    if (value < node.value) {
      // put on the left
      if (node.left == null) {
        node.addLeft(value)
      } else {
        await this.#insert(node.left, value)
      }
    }

    if (value > node.value) {
      // put on the right
      if (node.right == null) {
        node.addRight(value)
      } else {
        await this.#insert(node.right, value)
      }
    }
  }

  // TODO: Fix edge cases where delete is failing (e.g deleting '2')
  async #delete(node, value) {
    if (node == null) return;

    node.active = true
    await sleep(sleepDelay)
    node.active = false

    if (value == node.value) {
      if (node.right == null && node.left == null) {
        return null
      } else if  (node.left == null) {
        return node.right
      } else if (node.right == null) {
        return node.left
      } else {
        let tmp = smallestNode(node.right)
        node.value = tmp.value
        node.right = await this.#delete(node.right)
        return node
      }
    } else if (value < node.value) {
      node.left = await this.#delete(node.left, value)
      return node
    } else {
      node.right = await this.#delete(node.right, value)
      return node
    }
  }

  async #find(node, value) {
    if (node == null) return;

    node.active = true
    await sleep(sleepDelay)

    if (node.value == value) {
      await sleep(sleepDelay)
      node.active = false
      return true
    }

    node.active = false

    if (node.left != null && node.value > value) {
      return await this.#find(node.left, value)
    }

    if (node.right != null && node.value < value) {
      return await this.#find(node.right, value)
    }

    return false
  }
}

function smallestNode(node) {
  if (node.left == null) {
    return node
  } else {
    return smallestNode(node.left)
  }
}

async function addToTreeFromUI(event) {
  const number = parseInt(document.getElementById('number-to-add').value)
  if (number == NaN) return;
  await tree.insert(number)
}

async function deleteFromToTreeFromUI(event) {
  const number = parseInt(document.getElementById('number-to-delete').value)
  if (number == NaN) return;
  await tree.delete(number)
}

function clearTree(event) {
  tree = new Tree()
}

async function findInTreeFromUI(event) {
  const number = parseInt(document.getElementById('number-to-find').value)
  if (number == NaN) return;
  await tree.find(number)
}

function drawTree(tree) {
  function drawNode(node) {
    if (node == null) return;

    if (node.left != null) {
      line(node.position.x, node.position.y, node.left.position.x, node.left.position.y)
    }

    if (node.right != null) {
      line(node.position.x, node.position.y, node.right.position.x, node.right.position.y)
    }

    textAlign(CENTER, CENTER)
    if (node.active) {
      fill(color(0, 255, 0))
    } else {
      fill(255)
    }
    circle(node.position.x, node.position.y, 30 * scale)
    fill(0)
    textSize(18 * scale)
    text(node.value, node.position.x, node.position.y)

    drawNode(node.left)
    drawNode(node.right)
  }
  drawNode(tree.root)
}

const addButtonListener = (id, f) =>
  document.getElementById(id).addEventListener('click', f)

function updateSleepDelay() {
  sleepDelay = document.getElementById('sleep-delay').value
}

async function setup() {
  createCanvas(800, 800)

  addButtonListener('insert-button', addToTreeFromUI)
  addButtonListener('delete-button', deleteFromToTreeFromUI)
  addButtonListener('find-button', findInTreeFromUI)
  addButtonListener('clear-tree-button', clearTree)

  tree = new Tree()
  await tree.insert(5)
  await tree.insert(2)
  await tree.insert(1)
  await tree.insert(-1)
  await tree.insert(0)
  await tree.insert(10)
  await tree.insert(9)
  await tree.insert(7)
  await tree.insert(3)
  console.log(tree)
}

function draw() {
  background(220)
  updateSleepDelay()
  drawTree(tree)
}
