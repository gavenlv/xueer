/**
 * 思维导图与拓展阅读（按需加载）。
 *
 * 详情页、知识拓展页都要用它们，所以这两个数组与「哪个模块的内容」无关，
 * 单独成一块随任意模块一起加载。
 */

import type { Extension, MindMap } from '../../../types';

import { mindMapsBooks } from '../mindmaps-books';
import { mindMapsClassical } from '../mindmaps-classical';
import { mindMapsSkills } from '../mindmaps-skills';
import { extensionsBooks } from '../extensions-books';
import { extensionsOthers } from '../extensions-others';

/** 全部思维导图 */
export const maps: MindMap[] = [...mindMapsBooks, ...mindMapsClassical, ...mindMapsSkills];

/** 全部拓展阅读 */
export const exts: Extension[] = [...extensionsBooks, ...extensionsOthers];
