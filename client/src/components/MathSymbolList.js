import React, { Component, createRef } from 'react';

const componentStyle = {
  display: "flex",
  "flex-wrap": "wrap"
}

const childStyle = {
  flex: "1 0 18%"
}

class MathSymbolList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      geometry: {
        angle: '∠',
        right_angle: '∟',
        degree: '°',
        perpendicular: '⊥',
        parallel: '∥',
        congruent: '≅',
        similarity: '~',
        triangle: 'Δ',
        pi: 'π',
        congruent: '≅'
      },
      basic_math: {
        not_equal: '≠',
        approximately_equal: '≈',
        inequality: '≥',
        inequality_left: '≤',
        plus_minus: '±',
        minus_plus: '±',
        times: '×',
        multiplication_dot: '⋅',
        division: '÷',
        root: '√'
      },
      algebra: {
        integral: '∫',
        equivalence: '≡',
        equal_by_definition: '≜',
        proportional: '∝',
      	lemniscate: '∞',
        sigma: '∑',
        capital_pi: '∏',
        euler: 'γ',
        golden_ratio: 'φ',
        mean: 'μ',
        tensor: '⊗',
        hermitian: '†',
        intersection: '⋂',
        union: '⋃',
        subset: '⊆',
        strict_subset: '⊂',
        not_subset: '⊄',
        superset: '⊇',
        strict_superset: '⊃',
        not_superset: '⊅',
        belongs_to: '∈',
        does_not_belong: '∉',
        not: '¬',
        oplus: '⊕',
        implies: '⇒',
        equivalent: '⇔',
        equivalent_2: '↔',
        all: '∀',
        exists: '∃',
        does_not_exist: '∄',
        therefore: '∴',
        because: '∵'
      }
    };
  }


  render() {
    return <div className='math-symbol-list' style={componentStyle}>{
      Object.keys(this.state).map(math_type =>
        Object.keys(this.state[math_type]).map(math_element =>
          {
            return <div className="math_element" style={childStyle} key={math_element}>
              { this.state[math_type][math_element] }
            </div>
          }
        )
      )
    }</div>
  }
}


export default MathSymbolList;
