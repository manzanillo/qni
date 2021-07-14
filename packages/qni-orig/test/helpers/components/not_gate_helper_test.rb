require 'test_helper'

class Components::NotGateHelperTest < ActionView::TestCase
  include Components::GatesHelper
  include Components::WiresHelper
  include IconsHelper

  test 'not_gate' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate)
      <div class="draggable draggable--circuit gate gate--ifable not-gate"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate if:' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate(if: 'alice_h'))
      <div class="draggable draggable--circuit gate gate--ifable not-gate"
           data-if="alice_h"
           data-gate-label="if alice_h"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate disabled: true' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate(disabled: true))
      <div class="draggable draggable--circuit gate gate--disabled gate--ifable not-gate"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate bit: 1, controls: [0]' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate(bit: 1, controls: [0]))
      <div class="connectable--lower-bit draggable draggable--circuit gate gate--ifable not-gate"
           data-controls="0"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate bit: 0, controls: [1]' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate(bit: 0, controls: [1]))
      <div class="connectable--upper-bit draggable draggable--circuit gate gate--ifable not-gate"
           data-controls="1"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate bit: 0, controls: [2,1,3]' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate(bit: 0, controls: [2, 1, 3]))
      <div class="connectable--upper-bit draggable draggable--circuit gate gate--ifable not-gate"
           data-controls="1,2,3"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate bit: 3, controls: [1,2], targets: [4]' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate(bit: 3, controls: [1, 2], targets: [4]))
      <div class="connectable--lower-bit connectable--upper-bit draggable draggable--circuit gate gate--ifable not-gate"
           data-controls="1,2"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate palette: true' do
    assert_dom_equal beautify(<<~ERB), beautify(not_gate(palette: true))
      <div class="draggable draggable--palette gate gate--ifable not-gate"
           data-gate-popup-type="if"
           data-action="mouseenter->gate-description#initPopup:passive mousedown->editor#grabDraggable:passive mouseup->editor#releaseDraggable:passive click->editor#ignoreDraggableClick:passive">
        #{wires wireable: false}
        <div class="gate__body">
          #{plus_icon class: 'gate-icon'}
        </div>
      </div>
    ERB
  end

  test 'not_gate bit: -1' do
    assert_raises ActiveModel::ValidationError do
      not_gate(bit: -1)
    end
  end

  test 'not_gate bit: 11' do
    assert_raises ActiveModel::ValidationError do
      not_gate(bit: 11)
    end
  end

  test 'not_gate bit: :foo' do
    assert_raises ActiveModel::ValidationError do
      not_gate(bit: :foo)
    end
  end

  test 'not_gate controls: -1' do
    assert_raises ActiveModel::ValidationError do
      not_gate(controls: -1)
    end
  end

  test 'not_gate controls: :foo' do
    assert_raises ActiveModel::ValidationError do
      not_gate(controls: :foo)
    end
  end

  test 'not_gate controls: [:foo]' do
    assert_raises ActiveModel::ValidationError do
      not_gate(controls: [:foo])
    end
  end

  test 'not_gate controls: [-1]' do
    assert_raises ActiveModel::ValidationError do
      not_gate(controls: [-1])
    end
  end

  test 'not_gate controls: 11' do
    assert_raises ActiveModel::ValidationError do
      not_gate(controls: 11)
    end
  end

  test 'not_gate controls: [11]' do
    assert_raises ActiveModel::ValidationError do
      not_gate(controls: [11])
    end
  end

  test 'not_gate targets: -1' do
    assert_raises ActiveModel::ValidationError do
      not_gate(targets: -1)
    end
  end

  test 'not_gate targets: :foo' do
    assert_raises ActiveModel::ValidationError do
      not_gate(targets: :foo)
    end
  end

  test 'not_gate targets: [:foo]' do
    assert_raises ActiveModel::ValidationError do
      not_gate(targets: [:foo])
    end
  end

  test 'not_gate targets: [-1]' do
    assert_raises ActiveModel::ValidationError do
      not_gate(targets: [-1])
    end
  end

  test 'not_gate targets: 11' do
    assert_raises ActiveModel::ValidationError do
      not_gate(targets: 11)
    end
  end

  test 'not_gate targets: [11]' do
    assert_raises ActiveModel::ValidationError do
      not_gate(targets: [11])
    end
  end
end
