var BK_FLAGS = {
  MX: 'r 0 0 10.05 20 #006847;r 10 0 10.05 20 #FFFFFF;r 20 0 10.05 20 #CE1126;c 15 10 3.2 #A97C50;c 15 10 2 #6E8B3D',
  US: 'r 0 0 30 1.59 #B22234;r 0 1.54 30 1.59 #FFFFFF;r 0 3.08 30 1.59 #B22234;r 0 4.62 30 1.59 #FFFFFF;r 0 6.15 30 1.59 #B22234;r 0 7.69 30 1.59 #FFFFFF;r 0 9.23 30 1.59 #B22234;r 0 10.77 30 1.59 #FFFFFF;r 0 12.31 30 1.59 #B22234;r 0 13.85 30 1.59 #FFFFFF;r 0 15.38 30 1.59 #B22234;r 0 16.92 30 1.59 #FFFFFF;r 0 18.46 30 1.59 #B22234;r 0 0 13 10.8 #3C3B6E;c 1.40 1.50 0.55 #FFFFFF;c 3.80 1.50 0.55 #FFFFFF;c 6.20 1.50 0.55 #FFFFFF;c 8.60 1.50 0.55 #FFFFFF;c 11 1.50 0.55 #FFFFFF;c 1.40 4 0.55 #FFFFFF;c 3.80 4 0.55 #FFFFFF;c 6.20 4 0.55 #FFFFFF;c 8.60 4 0.55 #FFFFFF;c 11 4 0.55 #FFFFFF;c 1.40 6.50 0.55 #FFFFFF;c 3.80 6.50 0.55 #FFFFFF;c 6.20 6.50 0.55 #FFFFFF;c 8.60 6.50 0.55 #FFFFFF;c 11 6.50 0.55 #FFFFFF;c 1.40 9 0.55 #FFFFFF;c 3.80 9 0.55 #FFFFFF;c 6.20 9 0.55 #FFFFFF;c 8.60 9 0.55 #FFFFFF;c 11 9 0.55 #FFFFFF',
  ES: 'r 0 0 30 5.05 #AA151B;r 0 5 30 10.05 #F1BF00;r 0 15 30 5.05 #AA151B;r 7 7 4 6 #AD1519;r 7.8 7.8 2.4 4.4 #F1BF00;r 8.5 8.6 1.0 2.8 #AA151B',
  AR: 'r 0 0 30 6.72 #74ACDF;r 0 6.67 30 6.72 #FFFFFF;r 0 13.33 30 6.72 #74ACDF;c 15 10 2.4 #F6B40E;c 15 10 1.4 #FFD25A',
  CO: 'r 0 0 30 10.05 #FCD116;r 0 10 30 5.05 #003893;r 0 15 30 5.05 #CE1126',
  CL: 'r 0 0 30 10.05 #FFFFFF;r 0 10 30 10.05 #D52B1E;r 0 0 10 10 #0039A6;p 5 1.60 5.80 3.90 8.23 3.95 6.29 5.42 7.00 7.75 5 6.36 3.00 7.75 3.71 5.42 1.77 3.95 4.20 3.90 #FFFFFF',
  PE: 'r 0 0 10.05 20 #D91023;r 10 0 10.05 20 #FFFFFF;r 20 0 10.05 20 #D91023',
  VE: 'r 0 0 30 6.72 #FFCC00;r 0 6.67 30 6.72 #00247D;r 0 13.33 30 6.72 #CF142B;c 8.89 8.95 0.65 #FFFFFF;c 10.02 7.14 0.65 #FFFFFF;c 11.75 5.80 0.65 #FFFFFF;c 13.87 5.09 0.65 #FFFFFF;c 16.13 5.09 0.65 #FFFFFF;c 18.25 5.80 0.65 #FFFFFF;c 19.98 7.14 0.65 #FFFFFF;c 21.11 8.95 0.65 #FFFFFF',
  EC: 'r 0 0 30 10.05 #FFDD00;r 0 10 30 5.05 #034EA2;r 0 15 30 5.05 #ED1C24;c 15 10 2.6 #8A5A2B;c 15 10 1.4 #7FB5E8',
  GT: 'r 0 0 10.05 20 #4997D0;r 10 0 10.05 20 #FFFFFF;r 20 0 10.05 20 #4997D0;c 15 10 3 #3E8E4A;c 15 10 1.6 #E8D47A',
  CR: 'r 0 0 30 3.38 #002B7F;r 0 3.33 30 3.38 #FFFFFF;r 0 6.67 30 6.72 #CE1126;r 0 13.33 30 3.38 #FFFFFF;r 0 16.67 30 3.38 #002B7F',
  DO: 'r 0 0 30 20 #FFFFFF;r 0 0 12.5 8.5 #002D62;r 17.5 0 12.5 8.5 #CE1126;r 0 11.5 12.5 8.5 #CE1126;r 17.5 11.5 12.5 8.5 #002D62;c 15 10 1.8 #3E8E4A',
  UY: 'r 0 0 30 2.27 #FFFFFF;r 0 2.22 30 2.27 #0038A8;r 0 4.44 30 2.27 #FFFFFF;r 0 6.67 30 2.27 #0038A8;r 0 8.89 30 2.27 #FFFFFF;r 0 11.11 30 2.27 #0038A8;r 0 13.33 30 2.27 #FFFFFF;r 0 15.56 30 2.27 #0038A8;r 0 17.78 30 2.27 #FFFFFF;r 0 0 11 8.9 #FFFFFF;c 5.5 4.4 2.5 #FCD116;c 5.5 4.4 1.5 #F5A700',
  PY: 'r 0 0 30 6.72 #D52B1E;r 0 6.67 30 6.72 #FFFFFF;r 0 13.33 30 6.72 #0038A8;c 15 10 2.6 #3E8E4A;c 15 10 1.7 #FCD116',
  BO: 'r 0 0 30 6.72 #D52B1E;r 0 6.67 30 6.72 #F9E300;r 0 13.33 30 6.72 #007934;c 15 10 2 #8A5A2B',
  HN: 'r 0 0 30 6.72 #0073CF;r 0 6.67 30 6.72 #FFFFFF;r 0 13.33 30 6.72 #0073CF;c 11.50 10 0.70 #0073CF;c 18.50 10 0.70 #0073CF;c 15 10 0.70 #0073CF;c 12.70 8.20 0.70 #0073CF;c 17.30 11.80 0.70 #0073CF',
  SV: 'r 0 0 30 6.72 #0F47AF;r 0 6.67 30 6.72 #FFFFFF;r 0 13.33 30 6.72 #0F47AF;c 15 10 2.6 #3E8E4A;c 15 10 1.6 #FCD116',
  NI: 'r 0 0 30 6.72 #0067C6;r 0 6.67 30 6.72 #FFFFFF;r 0 13.33 30 6.72 #0067C6;p 15 7 18 12.5 12 12.5 #3E8E4A;c 15 11.2 0.7 #FCD116',
  PA: 'r 0 0 30 20 #FFFFFF;r 15 0 15 10 #DA121A;r 0 10 15 10 #072357;p 7.50 2 8.21 4.03 10.35 4.07 8.64 5.37 9.26 7.43 7.50 6.20 5.74 7.43 6.36 5.37 4.65 4.07 6.79 4.03 #072357;p 22.50 12 23.21 14.03 25.35 14.07 23.64 15.37 24.26 17.43 22.50 16.20 20.74 17.43 21.36 15.37 19.65 14.07 21.79 14.03 #DA121A',
  CU: 'r 0 0 30 4.05 #002A8F;r 0 4 30 4.05 #FFFFFF;r 0 8 30 4.05 #002A8F;r 0 12 30 4.05 #FFFFFF;r 0 16 30 4.05 #002A8F;p 0 0 13 10 0 20 #CB1515;p 4.60 7.20 5.26 9.09 7.26 9.13 5.67 10.35 6.25 12.27 4.60 11.12 2.95 12.27 3.53 10.35 1.94 9.13 3.94 9.09 #FFFFFF',
  PR: 'r 0 0 30 4.05 #ED0000;r 0 4 30 4.05 #FFFFFF;r 0 8 30 4.05 #ED0000;r 0 12 30 4.05 #FFFFFF;r 0 16 30 4.05 #ED0000;p 0 0 13 10 0 20 #0050F0;p 4.60 7.20 5.26 9.09 7.26 9.13 5.67 10.35 6.25 12.27 4.60 11.12 2.95 12.27 3.53 10.35 1.94 9.13 3.94 9.09 #FFFFFF',
  BR: 'r 0 0 30 20 #009C3B;p 15 2 27 10 15 18 3 10 #FFDF00;c 15 10 4.6 #002776;l 10.8 9 19.2 11.4 1.1 #FFFFFF',
  CA: 'r 0 0 7.55 20 #D80621;r 7.50 0 15.05 20 #FFFFFF;r 22.50 0 7.55 20 #D80621;p 15 4 16.4 7 18.8 6.2 17.8 10.2 20 10.6 16.2 13.8 16.2 16.2 15.5 16.2 15.5 14.4 14.5 14.4 14.5 16.2 13.8 16.2 13.8 13.8 10 10.6 12.2 10.2 11.2 6.2 13.6 7 #D80621',
  GB: 'k 0 0 30 20;r 0 0 30 20 #012169;l 0 0 30 20 4 #FFFFFF;l 30 0 0 20 4 #FFFFFF;l 0 0 30 20 1.80 #C8102E;l 30 0 0 20 1.80 #C8102E;r 0 6.60 30 6.80 #FFFFFF;r 11.60 0 6.80 20 #FFFFFF;r 0 8.30 30 3.40 #C8102E;r 13.30 0 3.40 20 #C8102E;z',
  FR: 'r 0 0 10.05 20 #0055A4;r 10 0 10.05 20 #FFFFFF;r 20 0 10.05 20 #EF4135',
  DE: 'r 0 0 30 6.72 #000000;r 0 6.67 30 6.72 #DD0000;r 0 13.33 30 6.72 #FFCE00',
  IT: 'r 0 0 10.05 20 #009246;r 10 0 10.05 20 #FFFFFF;r 20 0 10.05 20 #CE2B37',
  PT: 'r 0 0 12.05 20 #006600;r 12 0 18.05 20 #FF0000;c 12 10 4 #FFCC00;c 12 10 2.6 #FF0000;c 12 10 1.6 #FFFFFF',
  MA: 'r 0 0 30 20 #C1272D;p 15 5.20 16.53 8.30 19.95 8.79 17.47 11.20 18.06 14.61 15 13 11.94 14.61 12.53 11.20 10.05 8.79 13.47 8.30 #006233;p 15 7.30 15.91 9.15 17.95 9.44 16.47 10.88 16.82 12.91 15 11.95 13.18 12.91 13.53 10.88 12.05 9.44 14.09 9.15 #C1272D',
  JP: 'r 0 0 30 20 #FFFFFF;c 15 10 6 #BC002D',
  KR: 'r 0 0 30 20 #FFFFFF;a 15 10 5.2 180 180 #CD2E3A;a 15 10 5.2 0 180 #0047A0;c 11.7 10 2.6 #CD2E3A;c 18.3 10 2.6 #0047A0;l 5 4 8 6.4 1.1 #000000;l 22 13.6 25 16 1.1 #000000;l 22 6.4 25 4 1.1 #000000;l 5 16 8 13.6 1.1 #000000',
  CN: 'r 0 0 30 20 #DE2910;p 5.50 1.90 6.35 4.34 8.92 4.39 6.87 5.94 7.62 8.41 5.50 6.94 3.38 8.41 4.13 5.94 2.08 4.39 4.65 4.34 #FFDE00;c 10.50 2.50 0.70 #FFDE00;c 12.50 4.80 0.70 #FFDE00;c 12.50 7.80 0.70 #FFDE00;c 10.50 10 0.70 #FFDE00',
  IN: 'r 0 0 30 6.72 #FF9933;r 0 6.67 30 6.72 #FFFFFF;r 0 13.33 30 6.72 #138808;c 15 10 2.6 #000080;c 15 10 2 #FFFFFF;c 15 10 0.6 #000080',
  ID: 'r 0 0 30 10.05 #CE1126;r 0 10 30 10.05 #FFFFFF',
  RU: 'r 0 0 30 6.72 #FFFFFF;r 0 6.67 30 6.72 #0039A6;r 0 13.33 30 6.72 #D52B1E',
  TR: 'r 0 0 30 20 #E30A17;c 11 10 5.2 #FFFFFF;c 12.6 10 4.2 #E30A17;p 18.30 7.75 18.00 9.56 19.54 10.54 17.73 10.81 17.27 12.59 16.45 10.95 14.62 11.06 15.93 9.77 15.26 8.07 16.89 8.91 #FFFFFF',
  PH: 'r 0 0 30 10.05 #0038A8;r 0 10 30 10.05 #CE1126;p 0 0 14 10 0 20 #FFFFFF;c 4 10 2 #FCD116;p 1.70 2.40 1.98 3.21 2.84 3.23 2.16 3.75 2.41 4.57 1.70 4.08 0.99 4.57 1.24 3.75 0.56 3.23 1.42 3.21 #FCD116;p 1.70 15.20 1.98 16.01 2.84 16.03 2.16 16.55 2.41 17.37 1.70 16.88 0.99 17.37 1.24 16.55 0.56 16.03 1.42 16.01 #FCD116;p 10.60 8.80 10.88 9.61 11.74 9.63 11.06 10.15 11.31 10.97 10.60 10.48 9.89 10.97 10.14 10.15 9.46 9.63 10.32 9.61 #FCD116',
  AU: 'r 0 0 30 20 #012169;k 0 0 15 10;r 0 0 15 10 #012169;l 0 0 15 10 2 #FFFFFF;l 15 0 0 10 2 #FFFFFF;l 0 0 15 10 0.90 #C8102E;l 15 0 0 10 0.90 #C8102E;r 0 3.30 15 3.40 #FFFFFF;r 5.80 0 3.40 10 #FFFFFF;r 0 4.15 15 1.70 #C8102E;r 6.65 0 1.70 10 #C8102E;z;p 7.50 11.60 8.45 13.89 10.92 14.09 9.04 15.70 9.62 18.11 7.50 16.82 5.38 18.11 5.96 15.70 4.08 14.09 6.55 13.89 #FFFFFF;p 22.50 2.80 22.95 3.88 24.12 3.97 23.23 4.74 23.50 5.88 22.50 5.26 21.50 5.88 21.77 4.74 20.88 3.97 22.05 3.88 #FFFFFF;p 26 8.30 26.45 9.38 27.62 9.47 26.73 10.24 27.00 11.38 26 10.77 25.00 11.38 25.27 10.24 24.38 9.47 25.55 9.38 #FFFFFF;p 22.50 13.80 22.95 14.88 24.12 14.97 23.23 15.74 23.50 16.88 22.50 16.27 21.50 16.88 21.77 15.74 20.88 14.97 22.05 14.88 #FFFFFF;p 19 7.80 19.45 8.88 20.62 8.97 19.73 9.74 20.00 10.88 19 10.27 18.00 10.88 18.27 9.74 17.38 8.97 18.55 8.88 #FFFFFF'
};
var BK_FC = {};
function bkDefs() {
  if (typeof document === 'undefined' || !document.body || document.getElementById('bkdefs')) return;
  var d = document.createElement('div');
  d.id = 'bkdefs';
  d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = '<svg width="0" height="0" aria-hidden="true"><defs>' +
    '<clipPath id="bkc"><rect width="30" height="20" rx="4"/></clipPath>' +
    '<linearGradient id="bkb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>' +
    '<linearGradient id="bkr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".5" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>' +
    '<linearGradient id="bkn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E9AB5"/><stop offset="1" stop-color="#5C6784"/></linearGradient>' +
    '<radialGradient id="bkw" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#59B6FF"/><stop offset="1" stop-color="#1B63C9"/></radialGradient>' +
    '<clipPath id="bkwc"><circle cx="10" cy="10" r="9.6"/></clipPath>' +
    '</defs></svg>';
  document.body.appendChild(d);
}
function bkShapes(code) {
  var out = '', ci = 0, open = 0;
  BK_FLAGS[code].split(';').forEach(function (raw) {
    var t = raw.trim().split(' '), k = t[0], n = t.slice(1, -1).map(Number), c = t[t.length - 1];
    if (k === 'z') { out += '</g>'; open--; return; }
    if (k === 'k') {
      var id = 'bk' + code + (ci++), a = t.slice(1).map(Number);
      out += '<clipPath id="' + id + '"><rect x="' + a[0] + '" y="' + a[1] + '" width="' + a[2] + '" height="' + a[3] + '"/></clipPath><g clip-path="url(#' + id + ')">'; open++; return;
    }
    if (k === 'r') out += '<rect x="' + n[0] + '" y="' + n[1] + '" width="' + n[2] + '" height="' + n[3] + '" fill="' + c + '"/>';
    else if (k === 'c') out += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + n[2] + '" fill="' + c + '"/>';
    else if (k === 'p') { var pts = []; for (var i = 0; i + 1 < n.length; i += 2) pts.push(n[i] + ',' + n[i + 1]); out += '<polygon points="' + pts.join(' ') + '" fill="' + c + '"/>'; }
    else if (k === 'l') out += '<line x1="' + n[0] + '" y1="' + n[1] + '" x2="' + n[2] + '" y2="' + n[3] + '" stroke="' + c + '" stroke-width="' + n[4] + '"/>';
    else if (k === 'a') {
      var r = n[2], s = n[3] * Math.PI / 180, e = (n[3] + n[4]) * Math.PI / 180;
      out += '<path d="M' + n[0] + ' ' + n[1] + 'L' + (n[0] + r * Math.cos(s)).toFixed(2) + ' ' + (n[1] + r * Math.sin(s)).toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + (n[4] > 180 ? 1 : 0) + ' 1 ' + (n[0] + r * Math.cos(e)).toFixed(2) + ' ' + (n[1] + r * Math.sin(e)).toFixed(2) + 'Z" fill="' + c + '"/>';
    }
  });
  while (open-- > 0) out += '</g>';
  return out;
}
/* Bandera «gema» de Blokku en SVG inline (mismo diseño que la app). h = alto en px. */
function bkFlag(cc, h) {
  bkDefs();
  cc = String(cc || '').toUpperCase();
  h = h || 16;
  var key = cc + '@' + h;
  if (BK_FC[key]) return BK_FC[key];
  var va = 'vertical-align:-' + Math.round(h * 0.2) + 'px;flex:none;filter:drop-shadow(0 1px 1.2px rgba(0,0,0,.45))';
  var s;
  if (!/^[A-Z]{2}$/.test(cc)) {
    s = '<svg class="bkf" viewBox="0 0 20 20" style="height:' + h + 'px;width:' + h + 'px;' + va + '" aria-label="Mundial"><g clip-path="url(#bkwc)"><rect width="20" height="20" fill="url(#bkw)"/>' +
      '<polygon points="3.6,2.8 8,1.8 10,5.2 8,8.2 5.5,9 3,7.4" fill="#3FBF6A"/><polygon points="9,10.2 12.5,10 13,13.5 11,17.5 9,14.5" fill="#3FBF6A"/><polygon points="13,3.4 17.5,4.4 18,9.5 14.5,10 13,7.5" fill="#3FBF6A"/>' +
      '<rect width="20" height="20" fill="url(#bkb)"/><ellipse cx="7" cy="4" rx="4" ry="2" fill="#fff" opacity=".19"/></g><circle cx="10" cy="10" r="9.6" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width=".9"/></svg>';
  } else {
    var inner = BK_FLAGS[cc] ? bkShapes(cc) : '<rect width="30" height="20" fill="url(#bkn)"/><text x="15" y="14" text-anchor="middle" font-size="10" font-weight="900" fill="#fff" font-family="sans-serif">' + cc + '</text>';
    s = '<svg class="bkf" viewBox="0 0 30 20" style="height:' + h + 'px;width:' + Math.round(h * 1.5) + 'px;' + va + '" aria-label="' + cc + '"><g clip-path="url(#bkc)">' + inner +
      '<rect width="30" height="20" fill="url(#bkb)"/><rect x="1.8" y="1.4" width="26.4" height="5" rx="2.6" fill="#fff" opacity=".15"/></g><rect x=".45" y=".45" width="29.1" height="19.1" rx="3.6" fill="none" stroke="url(#bkr)" stroke-width=".9"/></svg>';
  }
  return (BK_FC[key] = s);
}
