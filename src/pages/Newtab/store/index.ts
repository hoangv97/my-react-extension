import { create } from 'zustand';
import { useMindmapSlice } from './mindmap';
import { useWindowSlice } from './window';

const useStore = create<any, any>((...a) => ({
  ...useMindmapSlice(...a),
  ...useWindowSlice(...a),
}));

export default useStore;
