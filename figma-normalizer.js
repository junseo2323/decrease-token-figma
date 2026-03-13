"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaNormalizer = void 0;
var fs = require("fs/promises");
var path = require("path");
var FigmaNormalizer = /** @class */ (function () {
    function FigmaNormalizer(cacheDir, _model) {
        if (cacheDir === void 0) { cacheDir = './.figma_cache'; }
        if (_model === void 0) { _model = ''; }
        this.cacheDir = cacheDir;
    }
    FigmaNormalizer.prototype.extractTokens = function () {
        return __awaiter(this, arguments, void 0, function (componentName) {
            var sourcePath, rawText, assetDir_1, assetRegex, match, importStatements, downloadPromises, _loop_1, code, funcIndex, finalCode, colors, colorRegex, colorMatch, error_1;
            var _this = this;
            if (componentName === void 0) { componentName = "Component"; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sourcePath = path.join(this.cacheDir, "selection_".concat(componentName, ".tsx"));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fs.readFile(sourcePath, 'utf-8')];
                    case 2:
                        rawText = _a.sent();
                        console.log("\n\u23F3 \uD53C\uADF8\uB9C8 \uC5D0\uC14B \uCD94\uCD9C \uBC0F \uCF54\uB4DC \uCD5C\uC801\uD654 \uC911...");
                        assetDir_1 = path.join(process.cwd(), 'src', 'assets');
                        return [4 /*yield*/, fs.mkdir(assetDir_1, { recursive: true }).catch(function () { })];
                    case 3:
                        _a.sent();
                        assetRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*"?(http:\/\/localhost:\d+\/assets\/[^"]+\.(svg|png|jpg))"?;/g;
                        match = void 0;
                        importStatements = [];
                        downloadPromises = [];
                        _loop_1 = function () {
                            var varName = match[1]; // 예: imgVariant
                            var url = match[2]; // 예: http://localhost:3845/...
                            var ext = match[3]; // 예: png, svg
                            var filename = "".concat(componentName, "_").concat(varName, ".").concat(ext); // 예: Header_imgVariant.png
                            // 백그라운드에서 파일 다운로드 실행
                            downloadPromises.push((function () { return __awaiter(_this, void 0, void 0, function () {
                                var res, arrayBuffer, e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 4, , 5]);
                                            return [4 /*yield*/, fetch(url)];
                                        case 1:
                                            res = _a.sent();
                                            return [4 /*yield*/, res.arrayBuffer()];
                                        case 2:
                                            arrayBuffer = _a.sent();
                                            // src/assets 폴더에 실제 파일로 저장!
                                            return [4 /*yield*/, fs.writeFile(path.join(assetDir_1, filename), Buffer.from(arrayBuffer))];
                                        case 3:
                                            // src/assets 폴더에 실제 파일로 저장!
                                            _a.sent();
                                            return [3 /*break*/, 5];
                                        case 4:
                                            e_1 = _a.sent();
                                            console.error("\u274C \uC5D0\uC14B \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ".concat(filename));
                                            return [3 /*break*/, 5];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })());
                            // React 최상단에 들어갈 import 문으로 변환
                            importStatements.push("import ".concat(varName, " from './assets/").concat(filename, "';"));
                        };
                        while ((match = assetRegex.exec(rawText)) !== null) {
                            _loop_1();
                        }
                        if (!(downloadPromises.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(downloadPromises)];
                    case 4:
                        _a.sent();
                        console.log("\u2705 ".concat(downloadPromises.length, "\uAC1C\uC758 \uD53C\uADF8\uB9C8 \uC5D0\uC14B\uC744 src/assets \uD3F4\uB354\uC5D0 \uC131\uACF5\uC801\uC73C\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4!"));
                        _a.label = 5;
                    case 5:
                        code = rawText;
                        funcIndex = rawText.indexOf('function ');
                        if (funcIndex !== -1) {
                            code = rawText.substring(funcIndex);
                        }
                        // 2. 인라인 <svg> 태그 처리 (토큰 낭비 주범)
                        // data-name이 있는 경우: {/* SVG Icon: Home */} 형태로 주석 처리하여 Claude가 Lucide 아이콘 등을 쓰도록 유도
                        code = code.replace(/<svg[^>]*data-name="([^"]+)"[\s\S]*?<\/svg>/g, function (match, name) {
                            var pascalName = name
                                .trim()
                                .replace(/[^a-zA-Z0-9]+(.)/g, function (m, chr) { return chr.toUpperCase(); })
                                .replace(/^[a-z]/, function (m) { return m.toUpperCase(); });
                            return "{/* SVG Icon: ".concat(pascalName, " */}");
                        });
                        code = code.replace(/<svg[\s\S]*?<\/svg>/g, '{/* SVG Icon */}');
                        // 3. 기존 로컬 이미지 변수 선언부 텍스트 제거 (import로 대체되었으므로)
                        code = code.replace(/const img.*? = "http:\/\/localhost.*?;\n/g, '');
                        // 4. 노드 ID 삭제
                        code = code.replace(/\sdata-node-id="[^"]+"/g, '');
                        // 5. 절대 좌표 및 고정 픽셀 제거 (V3.2 로직)
                        code = code.replace(/(?:\s|^)(absolute|relative|fixed|shrink-0|flex-none)(?=\s|")/g, '');
                        code = code.replace(/(?:\s|^)(top|bottom|left|right|inset(?:-[xy])?|-?translate-[xy]|z|w|h|min-w|min-h|max-w|max-h|size)-[^"\s]+/g, '');
                        // 6. 빈 className 정리
                        code = code.replace(/className="([^"]*)"/g, function (match, p1) {
                            var cleaned = p1.replace(/\s+/g, ' ').trim();
                            return cleaned ? "className=\"".concat(cleaned, "\"") : '';
                        });
                        code = code.replace(/ className=""/g, '');
                        finalCode = importStatements.join('\n') + '\n\n' + code.trim();
                        colors = new Set();
                        colorRegex = /(#[0-9a-fA-F]{3,8}\b|rgba?\([\d\s,.]+\))/gi;
                        colorMatch = void 0;
                        while ((colorMatch = colorRegex.exec(code)) !== null) {
                            colors.add(colorMatch[1] ? colorMatch[1].toUpperCase() : colorMatch[0]);
                        }
                        return [2 /*return*/, {
                                component_name: componentName,
                                cleaned_code: finalCode,
                                colors: Array.from(colors).sort()
                            }];
                    case 6:
                        error_1 = _a.sent();
                        console.error("❌ 코드 클리닝 실패:", error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    FigmaNormalizer.prototype.generateHandoffMarkdown = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var colorSummary, mdContent, mdOutputPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        colorSummary = data.colors && data.colors.length > 0
                            ? "\n### \uD83C\uDFA8 Design Tokens (Colors)\n`".concat(data.colors.join('\`, \`'), "`\n\n")
                            : '';
                        mdContent = "# \uD83C\uDFA8 Optimized Figma React Code: ".concat(data.component_name, "\n").concat(colorSummary, "> **\uC9C0\uC2DC\uC0AC\uD56D:**\n> 1. \uC81C\uACF5\uB41C \uCF54\uB4DC\uB294 \uC808\uB300 \uC88C\uD45C\uAC00 \uC81C\uAC70\uB41C \uBF08\uB300\uC785\uB2C8\uB2E4. '\uC2A4\uD06C\uB9B0\uC0F7 \uC774\uBBF8\uC9C0'\uB97C \uB208\uC73C\uB85C \uBCF4\uACE0 \uB808\uC774\uC544\uC6C3(flex, gap, padding \uB4F1)\uC744 \uCD94\uAC00\uD558\uC5EC \uBC18\uC751\uD615\uC73C\uB85C \uC644\uC131\uD558\uC138\uC694.\n> 2. \uD53C\uADF8\uB9C8\uC758 \uC6D0\uBCF8 \uC774\uBBF8\uC9C0 \uC5D0\uC14B\uB4E4(\uC77C\uB7EC\uC2A4\uD2B8, \uBCF5\uC7A1\uD55C SVG \uB4F1)\uC740 **\uC774\uBBF8 `src/assets` \uD3F4\uB354\uC5D0 \uB2E4\uC6B4\uB85C\uB4DC\uB418\uC5B4 \uC0C1\uB2E8\uC5D0 import \uC120\uC5B8\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.** \uCF54\uB4DC\uC5D0 \uC788\uB294 \uADF8\uB300\uB85C(\uC608: `src={imgVariant}`) \uC0AC\uC6A9\uD558\uC138\uC694.\n> 3. \uC8FC\uC11D \uCC98\uB9AC\uB41C `{/* SVG Icon: \uC774\uB984 */}` \uBD80\uBD84\uC740 `lucide-react` \uAC19\uC740 \uBC94\uC6A9 \uC544\uC774\uCF58 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uC0AC\uC6A9\uD558\uC5EC \uC54C\uB9DE\uAC8C \uB300\uCCB4\uD558\uC138\uC694.\n\n```tsx\n").concat(data.cleaned_code, "\n```\n");
                        mdOutputPath = path.join(this.cacheDir, "handoff.md");
                        return [4 /*yield*/, fs.writeFile(mdOutputPath, mdContent, 'utf-8')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FigmaNormalizer;
}());
exports.FigmaNormalizer = FigmaNormalizer;
