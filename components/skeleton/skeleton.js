// components/skeleton/skeleton.js
Component({
  options: { addGlobalClass: true },
  properties: {
    loading: { type: Boolean, value: true },
    sections: {
      type: Object,
      value: {
        banner: false,
        tools: false,
        hscroll: false,
        waterfall: false,
        list: false,
      },
    },
  },
});
