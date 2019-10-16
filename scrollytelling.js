enterView({
  selector: '.step',
  offset: 0.4,
  enter: function(element) {
    console.log('entered')
    element.classList.add('entered')
    // Trigger stepin for current step
    d3.select(element).dispatch('stepin')
  },
  progress: function(element, nextElement, progress) {
    d3.select(element).dispatch('progress', {
      detail: {
        nextElement: nextElement,
        progress: progress
      }
    })
  },
  exit: function(element) {
    element.classList.remove('entered')
    // Trigger stepout for current step
    d3.select(element).dispatch('stepout')

    // Trigger stepin for previous step (if it exists)
    var previous = element.previousElementSibling
    if (previous && previous.classList.contains('step')) {
      d3.select(previous).dispatch('stepin')
    }
  }
})
