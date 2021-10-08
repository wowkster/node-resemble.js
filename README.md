# Optimized node-resemble.js

Fork of [node-resemble.js](https://www.npmjs.com/package/node-resemble-js) with async await.

Analyse and compare images with Javascript. This project does not need canvas or any other binary dependencies.
It is a modification of [Resemble.js](https://github.com/Huddle/Resemble.js)

## Installation

`npm install @wowkster/resemble`

## Example

Retrieve basic analysis on image.

```javascript
// Callback

const api = resemble(fileData).onComplete(function (data) {
    console.log(data)
    /*
      {
        red: 255,
        green: 255,
        blue: 255,
        brightness: 255
      }
   */
})
```

```javascript
// Async/Await

const data = await resemble(fileData).async()
console.log(data)
/*
  {
    red: 255,
    green: 255,
    blue: 255,
    brightness: 255
  }
*/
```

Use resemble to compare two images.

```javascript
// Callback

const diff = resemble(file)
    .compareTo(file2)
    .ignoreColors()
    .onComplete(data => {
        console.log(data)
        /*
          {
            misMatchPercentage : 100, // %
            isSameDimensions: true, // or false
            dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
            getImageDataUrl: function(){}
          }
        */
    })
```

```javascript
// Async/Await

const data = await resemble(file).compareTo(file2).ignoreColors().async()
console.log(data)

/*
 {
   misMatchPercentage : 100, // %
   isSameDimensions: true, // or false
   dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
   getImageDataUrl: function(){}
 }
*/
```

You can also change the comparison method after the first analysis.

```javascript
// diff.ignoreNothing();
// diff.ignoreColors();
diff.ignoreAntialiasing()
```

And change the output display style.

```javascript
resemble.outputSettings({
    errorColor: {
        red: 255,
        green: 0,
        blue: 255,
    },
    errorType: 'movement',
    transparency: 0.3,
})
// resembleControl.repaint();
```

---

Credits:

- Created by [James Cryer](https://github.com/jamescryer) and the Huddle development team.
- [Lukas Svoboda](https://github.com/lksv) - modification for node.js
- [Mirza Zeyrek](https://github.com/mirzazeyrek) - jpeg support
- [LarryG](https://github.com/larryg01) - dependency updates
- [Wowkster](https://github.com/wowkster) - updated for async/await
