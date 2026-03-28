import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
 
export const useReportStore = create(
  subscribeWithSelector((set, get) => ({
    //estado principal
    pages: [{ id: 1, elements: [] }],
    currentPageIndex: 0,
    pageOrientation: "landscape",
    reportName: "Relatório sem título",
    selectedElementId: null,
    alignGuides: [],
    gridLayout: "2x2",
    isDragOver: false,
 
    //seletores derivados-não causam re-render extra
    getCurrentPage: () => {
      const { pages, currentPageIndex } = get();
      return pages[currentPageIndex] ?? { id: -1, elements: [] };
    },
 
    //actions of page
    setPages: (pages) => set({ pages }),
 
    setCurrentPageIndex: (index) =>
      set({ currentPageIndex: index, selectedElementId: null }),
 
    setPageOrientation: (orientation) => set({ pageOrientation: orientation }),
 
    setReportName: (name) => set({ reportName: name }),
 
    addPage: () =>
      set((s) => {
        const newPages = [...s.pages, { id: Date.now(), elements: [] }];
        return { pages: newPages, currentPageIndex: newPages.length - 1 };
      }),
 
    deletePage: (index) =>
      set((s) => {
        if (s.pages.length === 1) return s; //min 1 page
        const newPages = s.pages.filter((_, i) => i !== index);
        const newIndex = Math.min(s.currentPageIndex, newPages.length - 1);
        return { pages: newPages, currentPageIndex: newIndex, selectedElementId: null };
      }),
 
    duplicatePage: (index) =>
      set((s) => {
        const newPages = [...s.pages];
        newPages.splice(index + 1, 0, {
          id: Date.now(),
          elements: JSON.parse(JSON.stringify(s.pages[index].elements)),
        });
        return { pages: newPages };
      }),
 
    //actions de elemento
    setSelectedElementId: (id) => set({ selectedElementId: id }),
 
    updateElement: (elementId, updates) =>
      set((s) => {
        const newPages = [...s.pages];
        const pageIdx = s.currentPageIndex;
        const elIdx = newPages[pageIdx].elements.findIndex((el) => el.id === elementId);
        if (elIdx === -1) return s;
        const newElements = [...newPages[pageIdx].elements];
        newElements[elIdx] = { ...newElements[elIdx], ...updates };
        newPages[pageIdx] = { ...newPages[pageIdx], elements: newElements };
        return { pages: newPages };
      }),
 
    addElement: (element) =>
      set((s) => {
        const newPages = [...s.pages];
        const pageIdx = s.currentPageIndex;
        newPages[pageIdx] = {
          ...newPages[pageIdx],
          elements: [...newPages[pageIdx].elements, element],
        };
        return { pages: newPages };
      }),
 
    deleteElement: (elementId) =>
      set((s) => {
        const newPages = [...s.pages];
        const pageIdx = s.currentPageIndex;
        newPages[pageIdx] = {
          ...newPages[pageIdx],
          elements: newPages[pageIdx].elements.filter((el) => el.id !== elementId),
        };
        return { pages: newPages, selectedElementId: null };
      }),
 
    duplicateElement: (elementId) =>
      set((s) => {
        const page = s.pages[s.currentPageIndex];
        const el = page.elements.find((e) => e.id === elementId);
        if (!el) return s;
        const newEl = {
          ...JSON.parse(JSON.stringify(el)),
          id: `${el.type}-${Date.now()}`,
          x: el.x + 20,
          y: el.y + 20,
        };
        const newPages = [...s.pages];
        newPages[s.currentPageIndex] = {
          ...page,
          elements: [...page.elements, newEl],
        };
        return { pages: newPages };
      }),
 
    addTextBox: () => {
      const el = {
        id: `text-${Date.now()}`,
        type: "text",
        content: "Digite aqui...",
        x: 100, y: 150,
        width: 300, height: 100,
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        color: "#000000",
        textAlign: "left", 
        backgroundColor: "transparent",
      };
      get().addElement(el);
      set({ selectedElementId: el.id });
    },
 
    //alignment guides
    setAlignGuides: (guides) => set({ alignGuides: guides }),
    clearAlignGuides: () => set({ alignGuides: [] }),
 
    //grid / drag
    setGridLayout: (layout) => set({ gridLayout: layout }),
    setIsDragOver: (v) => set({ isDragOver: v }),
 
    //carrega estado completo ao montar / abrir snapshot
    loadState: (data) =>
      set({
        pages: data.pages ?? [{ id: 1, elements: [] }],
        pageOrientation: data.pageOrientation ?? "landscape",
        reportName: data.reportName ?? "Relatório sem título",
        currentPageIndex: 0,
        selectedElementId: null,
      }),
  }))
);
 
//selector helpers
export const selectCurrentPage     = (s) => s.pages[s.currentPageIndex] ?? { id: -1, elements: [] };
export const selectSelectedId      = (s) => s.selectedElementId;
export const selectAlignGuides     = (s) => s.alignGuides;
export const selectGridLayout      = (s) => s.gridLayout;
export const selectIsDragOver      = (s) => s.isDragOver;
export const selectPageOrientation = (s) => s.pageOrientation;
export const selectReportName      = (s) => s.reportName;
export const selectPageCount       = (s) => s.pages.length;
export const selectCurrentIndex    = (s) => s.currentPageIndex;  
 
 