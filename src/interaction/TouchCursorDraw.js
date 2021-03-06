/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_TouchCursor from './TouchCursor'

/** TouchCursor interaction + ModifyFeature
 * @constructor
 * @extends {ol_interaction_TouchCursor}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {string} options.className cursor class name
 *  @param {ol.coordinate} options.coordinate cursor position
 *  @param {string} options.type geometry type
 *  @param {ol.source.Vector} options.source Destination source for the drawn features
 *  @param {ol.Collection<ol.Feature>} options.features Destination collection for the drawn features
 *  @param {number} options.clickTolerance The maximum distance in pixels for "click" event to add a point/vertex to the geometry being drawn. default 6
 *  @param {number} options.snapTolerance Pixel distance for snapping to the drawing finish, default 12
 *  @param {number} options.maxPoints The number of points that can be drawn before a polygon ring or line string is finished. By default there is no restriction.
 *  @param {number} options.minPoints The number of points that must be drawn before a polygon ring or line string can be finished. Default is 3 for polygon rings and 2 for line strings.
 *  @param {ol.style.Style} options.style Style for sketch features.
 *  @param {function} options.geometryFunction Function that is called when a geometry's coordinates are updated.
 *  @param {string} options.geometryName Geometry name to use for features created by the draw interaction.
 *  @param {boolean} options.wrapX Wrap the world horizontally on the sketch overlay, default false
 */
var ol_interaction_TouchCursorDraw = function(options) {
  options = options || {};

  // Draw 
  var sketch = this.sketch = new ol.layer.SketchOverlay({
    type: options.type
  });

  sketch.on('drawend', function(e) {
    if (e.valid && options.source) options.source.addFeature(e.feature);
  });

  // Buttons
  var buttons = [];
  if (options.type !== 'Point') {
    buttons =[{
      // Cancel drawing
      className: 'ol-button-x', 
      click: function() {
        sketch.abortDrawing();
      }
    }, { 
      // Add a new point (nothing to do, just click)
      className: 'ol-button-check',
      click: function() {
        sketch.finishDrawing(true);
      }
    }, { 
      // Remove a point
      className: 'ol-button-remove', 
      click: function() {
        sketch.removeLastPoint();
      }
    }]
  }
  
  // Create cursor
  ol_interaction_TouchCursor.call(this, {
    className: options.className,
    coordinate: options.coordinate,
    buttons: buttons
  });

  this.on('click', function(e) {
    this.sketch.addPoint(this.getPosition());
  }.bind(this))

  this.on('dragging', function(e) {
    this.sketch.setPosition(this.getPosition());
  }.bind(this))
};
ol_ext_inherits(ol_interaction_TouchCursorDraw, ol_interaction_TouchCursor);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_interaction_TouchCursorDraw.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().removeInteraction(this._modify);
  }

  if (map) {
    this.sketch.setMap(map);
  }

  ol_interaction_TouchCursor.prototype.setMap.call (this, map);
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @param {ol.coordinate|null} position position of the cursor (when activating), default viewport center.
 * @observable
 * @api
 */
ol_interaction_TouchCursorDraw.prototype.setActive = function(b, position) {
  ol_interaction_TouchCursor.prototype.setActive.call (this, b, position);
  this.sketch.abortDrawing();
  this.sketch.setVisible(b);
};

export default ol_interaction_TouchCursorDraw
