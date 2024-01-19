'use client'

import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'

const baseAtom = atom({
  activeContent:'', // current text in the editor
  activeContentPath: [], // path in standardInputJson
  activeLanguage: 'solidity', // current language for syntax highlighting
  activeContentReadOnly: false, // whether the editor is read only
  standardInputJson: {
    sources: {"source.sol": {content: ""}},
    language: "Solidity",
    settings: {
      outputSelection : {
        '*': {
          '*': [ '*' ]
        }
      }
    },
  }, // standard input json (optional)
  inputJson: {}, // current input json (optional)
  prettyInput: "", // current input json pretty printed (optional)
  compilationOutput: "",
  title: "", // title of the main contract (optioal)
  isCompiling: false,
  isWrappedJson: false,
  compilerVersion: "0.8.0",
});

const activeContentAtom = focusAtom(baseAtom, (optic) => optic.prop('activeContent'));
const activeContentPathAtom = focusAtom(baseAtom, (optic) => optic.prop('activeContentPath'));
const activeLanguageAtom = focusAtom(baseAtom, (optic) => optic.prop('activeLanguage'));
const inputJsonAtom = focusAtom(baseAtom, (optic) => optic.prop('inputJson'));
const standardInputJsonAtom = focusAtom(baseAtom, (optic) => optic.prop('standardInputJson'));
const compilationOutputAtom = focusAtom(baseAtom, (optic) => optic.prop('compilationOutput'));
const titleAtom = focusAtom(baseAtom, (optic) => optic.prop('title'));
const isCompilingAtom = focusAtom(baseAtom, (optic) => optic.prop('isCompiling'));
const isWrappedJsonAtom = focusAtom(baseAtom, (optic) => optic.prop('isWrappedJson'));
const compilerVersionAtom = focusAtom(baseAtom, (optic) => optic.prop('compilerVersion'));
const activeContentReadOnlyAtom = focusAtom(baseAtom, (optic) => optic.prop('activeContentReadOnly'));
const prettyInputAtom = focusAtom(baseAtom, (optic) => optic.prop('prettyInput'));
const sourcesAtom = focusAtom(standardInputJsonAtom, (optic) => optic.prop('sources'));

export {
  activeContentAtom,
  activeContentPathAtom,
  activeLanguageAtom,
  inputJsonAtom,
  standardInputJsonAtom,
  compilationOutputAtom,
  titleAtom,
  isCompilingAtom,
  isWrappedJsonAtom,
  compilerVersionAtom,
  activeContentReadOnlyAtom,
  prettyInputAtom,
  sourcesAtom,
}
