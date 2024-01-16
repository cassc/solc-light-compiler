'use client'

import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'

const baseAtom = atom({
  activeContent:'',
  activeContentPath: '',
  activeLanguage: 'solidity',
  inputJson: {},
  standardInputJson: {},
  compilationOutput: {},
  title: "",
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
}
