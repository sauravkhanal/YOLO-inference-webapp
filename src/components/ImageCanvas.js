import React, { useEffect, useRef } from 'react';
import img from '../images/a.jpg';

const ImageCanvas = ({ canvasWidth, canvasHeight, imgURL }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    let currentZoomLevel = 1;
    let isDragging = false;
    let dragStartPosition = { x: 0, y: 0 };
    let currentTransformedCursor;

    let scale;
    let scaledImgWidth;
    let scaledImgHeight;
    let startX;
    let startY;
    let canvasCenterX;
    let canvasCenterY;

    const ZOOMINLEVEL = 1.2;
    const ZOOMOUTLEVEL = 0.8;
    const MINZOOMLEVEL = 0.5;
    const MAXZOOMLEVEL = 15;
    const DEFAULTCURSOR = 'move';
    const MOUSEDOWNCURSOR = 'grab';
    const ZOOMINCURSOR = 'zoom-in';
    const ZOOMOUTCURSOR = 'zoom-out';
    const IMAGESMOOTHINGENABLED = false;

    function init() {
      scale = Math.min(canvas.width / image.width, canvas.height / image.height);
      scaledImgWidth = image.width * scale;
      scaledImgHeight = image.height * scale;
      startX = (canvas.width - scaledImgWidth) / 2;
      startY = (canvas.height - scaledImgHeight) / 2;
      canvasCenterX = canvas.width / 2;
      canvasCenterY = canvas.height / 2;
      canvas.style.cursor = DEFAULTCURSOR;
      context.save();
    }

    function reset() {
      context.restore();
      drawImageToCanvas();
      context.save();
      currentZoomLevel = 1;
      canvas.style.cursor = DEFAULTCURSOR;
    }

    function drawImageToCanvas() {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
      context.drawImage(image, startX, startY, scaledImgWidth, scaledImgHeight);
    }

    function addEventListeners() {
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('wheel', onWheel);
      canvas.addEventListener('mouseout', onMouseOut);
      document.getElementById('reset').addEventListener('click', function () {
        reset();
      });
    }

    function onMouseOut() {
      isDragging = false;
    }

    function onMouseDown(event) {
      isDragging = true;
      canvas.style.cursor = MOUSEDOWNCURSOR;
      dragStartPosition = getTransformedPoint(event.offsetX, event.offsetY);
    }

    function getTransformedPoint(x, y) {
      const originalPoint = new DOMPoint(x, y);
      return context.getTransform().invertSelf().transformPoint(originalPoint);
    }

    function onMouseMove(event) {
      canvas.style.cursor = DEFAULTCURSOR;
      currentTransformedCursor = getTransformedPoint(event.offsetX, event.offsetY);
      event.preventDefault();

      if (isDragging) {
        pan(
          currentTransformedCursor.x - dragStartPosition.x,
          currentTransformedCursor.y - dragStartPosition.y
        );
      }
    }

    function onMouseUp() {
      isDragging = false;
      canvas.style.cursor = DEFAULTCURSOR;
    }

    function onWheel(event) {
      zoom(event.deltaY < 0 ? ZOOMINLEVEL : ZOOMOUTLEVEL);
      event.preventDefault();
    }

    function zoom(zoomLevel) {
      if (currentZoomLevel === MINZOOMLEVEL && zoomLevel <= 1) {
        return;
      }

      if (currentZoomLevel === MAXZOOMLEVEL && zoomLevel >= 1) {
        return;
      }

      currentZoomLevel = Math.min(
        Math.max(currentZoomLevel * zoomLevel, MINZOOMLEVEL),
        MAXZOOMLEVEL
      );

      canvas.style.cursor = zoomLevel > 1 ? ZOOMINCURSOR : ZOOMOUTCURSOR;
      context.translate(currentTransformedCursor.x, currentTransformedCursor.y);
      context.scale(zoomLevel, zoomLevel);
      context.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);
      drawImageToCanvas();
    }

    function pan(x, y) {
      context.translate(x, y);
      drawImageToCanvas();
    }



    const image = new Image();

    image.src = imgURL || img;

    image.onload = function () {
      // Reset canvas and setup event listeners when image changes
      canvas.width = canvasWidth;
      canvas.height =canvasHeight;
      context.imageSmoothingEnabled = IMAGESMOOTHINGENABLED;
      init();
      reset();
      addEventListeners();
    };
  }, [imgURL]);
  const pStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    color: 'white',
    backgroundColor: 'black',
    borderTopRadius: 'inherit',
    ':hover': {
      backgroundColor: 'red',
    },
  };

  const containerStyle = {
    position: 'relative',
    height: canvasHeight,
    width: canvasWidth,
    border: '1px solid black',
  };
  return (
    <div id="canvas-container" style={containerStyle}>
      <p style={pStyle}>#text</p>
      <button id="reset" style={{ position: 'absolute', top: 0, right: 0 }}>
        ⟲
      </button>
      <canvas
        id="canvas"
        ref={canvasRef}
        height={canvasHeight}
        width={canvasWidth}
        style={{ border: '1px dotted red' }}
      ></canvas>
    </div>
  );
};

export default ImageCanvas;
