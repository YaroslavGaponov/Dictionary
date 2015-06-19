var SMalloc = require('smalloc');

var BinaryTree = function() {
    this._root = null;
}

BinaryTree.prototype.clear = function() {
    this._root = null;
}

BinaryTree.prototype.isEmpty = function() {
    return !this._root;
}

BinaryTree.prototype.has = function(key) {
    return !!this.search(key);
}

BinaryTree.prototype.search = function(key) {
    var curr = this._root;
    while (curr) {
        if (curr.key === key) {
            return curr;
        }
        curr = curr.key > key ? curr.left : curr.right;
    }
    return null;
}

BinaryTree.prototype.insert = function(key, value) {

    function _createNode(key, value, left, right) {
        return {
            key: key,
            value: value,
            left: left,
            right: right
        }
    }

    if (this.isEmpty()) {
        this._root = _createNode(key, value);
        return true;
    }

    var pred, dir, curr = this._root;
    while (curr) {
        if (curr.key === key) {
            curr.value = value;
            return false;
        }
        pred = curr;
        dir = curr.key > key ? 'left' : 'right';
        curr = curr[dir];
    }

    pred[dir] = _createNode(key, value);

    return true;

}

BinaryTree.prototype.remove = function(key) {
    function _lift(root, node) {
        if (root.right == null) {
            node.key = root.key;
            node.value = root.value;
            return root.left;
        } else {
            root.right = _lift(root.right, node);
            return root;
        }
    }

    function _remove(root, key) {
        if (root == null) {
            return null;
        } else if (key == root.key) {
            if (root.left == null)
                return root.right;
            else if (root.right == null) {
                return root.left;
            } else {
                root.left = _lift(root.left, root);
                return root;
            }
        } else {
            if (key < root.value) {
                root.left = _remove(root.left, key);
            } else {
                root.right = _remove(root.right, key);
            }
            return root;
        }
    }

    _remove(this._root, key);
}

var BigArray = function(length) {
    this._values = new Array(SMalloc.kMaxLength, SMalloc.Types.Uint16);
    this._index = 0;
    this._freeIndex = [];
}

BigArray.prototype.clear = function() {
    for (var indx = 0; indx < this._index; indx++) {
        SMalloc.dispose(this._values[indx]);
        this._values[indx] = null;
    }
    this._index = 0;
}

BigArray.prototype.has = function(indx) {
    return !!this._values[indx];
}

BigArray.prototype.get = function(indx) {
    var length = Object.keys(this._values[indx]).length;
    var s = new Array(length)
    for (var i = 0; i < s.length; i++) {
        s[i] = String.fromCharCode(this._values[indx][i]);
    }
    return s.join('');
}

BigArray.prototype.add = function(value) {
    var indx;
    if (this._freeIndex.length > 0) {
        indx = this._freeIndex.shift();
    } else {
        indx = this._index;
        this._index++;
    }
    var buf = SMalloc.alloc(value.length);
    for (var i = 0; i < value.length; i++) {
        buf[i] = value.charCodeAt(i);
    }
    this._values[indx] = buf;
    return indx;
}

BigArray.prototype.remove = function(indx) {
    SMalloc.dispose(this._values[indx]);
    this._freeIndex.push(indx);
    this._values[indx] = null;
}

BigArray.prototype.forEach = function(cb) {
    for (var indx = 0; indx < this._index; indx++) {
        if (this.has(indx)) {
            cb(this.get(indx))
        }
    }
}

var Dictionary = module.exports = function() {
    this._index = new BinaryTree();
    this._storage = new BigArray();
}

Dictionary.prototype.clear = function() {
    this._index.clear();
    this._storage.clear();
}

Dictionary.prototype.has = function(value) {
    return this._index.has(value);
}

Dictionary.prototype.add = function(value) {
    var node = this._index.search(value);
    if (!node) {
        var indx = this._storage.add(value);
        this._index.insert(value, indx);
        return indx;
    } else {
        return node.value;
    }
}

Dictionary.prototype.remove = function(value) {
    var node = this._index.search(value);
    if (node) {
        this._storage.remove(node.value);
        this._index.remove(value);
        return true;
    }
    return false;
}

Dictionary.prototype.get = function (indx) {
    return this._storage.get(indx);
}

Dictionary.prototype.forEach = function(cb) {
    this._storage.forEach(cb);
}
